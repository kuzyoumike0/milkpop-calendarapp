const path = require('path')
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const crypto = require('crypto')
const { Pool } = require('pg')

const app = express()
const PORT = process.env.PORT || 3000
app.set('trust proxy', 1)
app.use(express.json())

const AUTH_MODE = process.env.AUTH_MODE || 'optional'
const cookieSecure = process.env.COOKIE_SECURE === 'true'
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly:true, sameSite: cookieSecure ? 'none' : 'lax', secure: cookieSecure }
}))

app.use(passport.initialize())
app.use(passport.session())

const GID = process.env.GOOGLE_CLIENT_ID || ''
const GSECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const GCALLBACK = process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
const TW_KEY = process.env.TWITTER_CONSUMER_KEY || ''
const TW_SECRET = process.env.TWITTER_CONSUMER_SECRET || ''
const TW_CALLBACK = process.env.TWITTER_CALLBACK_URL || '/auth/twitter/callback'
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || ''

function slugify(email){ return encodeURIComponent(email) }
function makeGuest(){
  const rnd = Math.random().toString(36).slice(2,8)
  return { email:`guest_${rnd}@guest.local`, name:`Guest ${rnd}`, slug: encodeURIComponent(`guest_${rnd}@guest.local`), provider:'guest' }
}
if (GID && GSECRET) {
  passport.use(new GoogleStrategy({ clientID:GID, clientSecret:GSECRET, callbackURL:GCALLBACK },
    (accessToken,refreshToken,profile,done)=>{
      const email=(profile.emails&&profile.emails[0]&&profile.emails[0].value)||''
      const name=profile.displayName||''
      done(null,{ email,name,slug: slugify(email), provider:'google' })
    }))
}
if (TW_KEY && TW_SECRET) {
  passport.use(new TwitterStrategy({ consumerKey:TW_KEY, consumerSecret:TW_SECRET, callbackURL:TW_CALLBACK, includeEmail:true },
    (token,tokenSecret,profile,done)=>{
      const username=profile.username||`tw-${profile.id}`
      const email=(profile.emails&&profile.emails[0]&&profile.emails[0].value)||`${username}@twitter.local`
      const name=profile.displayName||username
      done(null,{ email,name,slug: slugify(email), provider:'twitter' })
    }))
}
passport.serializeUser((u,d)=>d(null,u)); passport.deserializeUser((o,d)=>d(null,o))

function requireAuth(req,res,next){
  const u = req.session?.user || req.user
  if (u) return next()
  if (AUTH_MODE === 'disabled') { req.session.user = makeGuest(); return next() }
  if (AUTH_MODE === 'optional') return next()
  return res.status(401).json({ error:'auth_required' })
}
app.use((req,_res,next)=>{ if(req.user) req.session.user=req.user; next() })

function baseUrl(req){
  if(PUBLIC_BASE_URL) return PUBLIC_BASE_URL.replace(/\/$/,'')
  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

// OAuth
app.get('/auth/google',(req,res,next)=>{ if(!(GID&&GSECRET)) return res.status(500).send('Google OAuth未設定'); return passport.authenticate('google',{scope:['profile','email']})(req,res,next)})
app.get('/auth/google/callback',(req,res,next)=>{ if(!(GID&&GSECRET)) return res.redirect('/login?err=oauth'); next() }, passport.authenticate('google',{failureRedirect:'/login?err=auth-failed',session:true}),(req,res)=>res.redirect(`/u/${req.user.slug}`))
app.get('/auth/twitter',(req,res,next)=>{ if(!(TW_KEY&&TW_SECRET)) return res.status(500).send('Twitter OAuth未設定'); return passport.authenticate('twitter')(req,res,next)})
app.get('/auth/twitter/callback',(req,res,next)=>{ if(!(TW_KEY&&TW_SECRET)) return res.redirect('/login?err=twitter-oauth'); next() }, passport.authenticate('twitter',{failureRedirect:'/login?err=twitter-auth-failed',session:true}),(req,res)=>res.redirect(`/u/${req.user.slug}`))
app.get('/auth/guest',(req,res)=>{ if(AUTH_MODE==='required') return res.redirect('/login?err=guest-disabled'); req.session.user=makeGuest(); return res.redirect(`/u/${req.session.user.slug}`)})
app.get('/auth/logout',(req,res)=>{ req.logout && req.logout(()=>{}); req.session.destroy(()=>res.redirect('/login')) })

// config / me
app.get('/api/config',(_req,res)=>{
  const googleConfigured=Boolean(GID&&GSECRET), twitterConfigured=Boolean(TW_KEY&&TW_SECRET)
  res.json({ oauthConfigured: googleConfigured||twitterConfigured, googleConfigured, twitterConfigured, authMode: AUTH_MODE })
})
app.get('/api/me',(req,res)=>{
  const u=req.session?.user||req.user; if(!u) return res.json({loggedIn:false,authMode:AUTH_MODE})
  return res.json({loggedIn:true,email:u.email,name:u.name,slug:u.slug,provider:u.provider||'oauth',authMode:AUTH_MODE})
})

// repo (pg or memory)
const hasPG=!!process.env.DATABASE_URL; let pool=null
if(hasPG){
  pool=new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL==='false'?false:{rejectUnauthorized:false} })
  ;(async()=>{
    await pool.query(`create table if not exists personal_events(id serial primary key,user_email text not null,date date not null,time_slot text not null,title text not null,memo text default '',created_at timestamptz default now());`)
    await pool.query(`create table if not exists shared_events(id serial primary key,date date not null,time_slot text not null,title text not null,created_by text not null,token text not null,created_at timestamptz default now());`)
    await pool.query(`create table if not exists events(id serial primary key,user_email text not null,title text not null,date date not null,created_at timestamptz default now());`)
    console.log('[DB] migrations ok')
  })().catch(e=>console.error('DB init error',e))
}
const mem={ personal:{}, shared:{}, events:{} }
async function repo_listPersonal(email){ if(hasPG){const {rows}=await pool.query('select * from personal_events where user_email=$1 order by date asc,id asc',[email]); return rows } return mem.personal[email]||[] }
async function repo_addPersonal(email,{title,memo='',date,time_slot}){ if(hasPG){const {rows}=await pool.query('insert into personal_events(user_email,date,time_slot,title,memo) values($1,$2,$3,$4,$5) returning *',[email,date,time_slot,title,memo]); return rows[0] } const item={id:String(Date.now())+Math.random().toString(36).slice(2,8),title,memo,date,time_slot,created_at:new Date().toISOString()}; mem.personal[email]=(mem.personal[email]||[]).concat([item]); return item }
async function repo_delPersonal(email,id){ if(hasPG) await pool.query('delete from personal_events where id=$1 and user_email=$2',[id,email]); else mem.personal[email]=(mem.personal[email]||[]).filter(x=>x.id!==id) }
async function repo_listShared(email){ if(hasPG){const {rows}=await pool.query('select * from shared_events where created_by=$1 order by date asc,id asc',[email]); return rows } return mem.shared[email]||[] }
async function repo_addShared(email,{title,date,time_slot,token,share_url}){ if(hasPG){const {rows}=await pool.query('insert into shared_events(date,time_slot,title,created_by,token) values($1,$2,$3,$4,$5) returning *',[date,time_slot,title,email,token]); const item=rows[0]; item.share_url=share_url; return item } const item={id:String(Date.now())+Math.random().toString(36).slice(2,8),title,date,time_slot,created_by:email,token,created_at:new Date().toISOString(),share_url}; mem.shared[email]=(mem.shared[email]||[]).concat([item]); return item }
async function repo_delShared(email,id){ if(hasPG) await pool.query('delete from shared_events where id=$1 and created_by=$2',[id,email]); else mem.shared[email]=(mem.shared[email]||[]).filter(x=>x.id!==id) }
async function repo_getSharedByToken(token){ if(hasPG){const {rows}=await pool.query('select * from shared_events where token=$1 limit 1',[token]); return rows[0]||null } for(const email of Object.keys(mem.shared)){const it=(mem.shared[email]||[]).find(e=>e.token===token); if(it) return it} return null }
async function repo_listEvents(email){ if(hasPG){const {rows}=await pool.query('select * from events where user_email=$1 order by date asc,id asc',[email]); return rows } return mem.events[email]||[] }
async function repo_addEvent(email,{title,date}){ if(hasPG){const {rows}=await pool.query('insert into events(user_email,title,date) values($1,$2,$3) returning *',[email,title,date]); return rows[0] } const item={id:String(Date.now())+Math.random().toString(36).slice(2,8),title,date,created_at:new Date().toISOString()}; mem.events[email]=(mem.events[email]||[]).concat([item]); return item }
async function repo_delEvent(email,id){ if(hasPG) await pool.query('delete from events where id=$1 and user_email=$2',[id,email]); else mem.events[email]=(mem.events[email]||[]).filter(x=>x.id!==id) }

// API
app.get('/api/personal', requireAuth, async (req,res)=>{ const email=(req.session.user||req.user)?.email||'guest@guest.local'; res.json(await repo_listPersonal(email)) })
app.post('/api/personal', requireAuth, async (req,res)=>{
  const email=(req.session.user||req.user)?.email||'guest@guest.local'
  const { title, memo='', date, time_slot, publish_to_shared=false } = req.body
  const item = await repo_addPersonal(email,{title,memo,date,time_slot})
  if(publish_to_shared){const token=crypto.randomBytes(16).toString('hex'); const share_url=`${baseUrl(req)}/share/${token}`; await repo_addShared(email,{title,date,time_slot,token,share_url})}
  res.json({success:true,item})
})
app.delete('/api/personal/:id', requireAuth, async (req,res)=>{ const email=(req.session.user||req.user)?.email||'guest@guest.local'; await repo_delPersonal(email,req.params.id); res.json({success:true}) })

app.get('/api/shared', requireAuth, async (req,res)=>{ const email=(req.session.user||req.user)?.email||'guest@guest.local'; res.json(await repo_listShared(email)) })
app.post('/api/shared', requireAuth, async (req,res)=>{
  const email=(req.session.user||req.user)?.email||'guest@guest.local'
  const { title, date, time_slot } = req.body
  const token=crypto.randomBytes(16).toString('hex'); const share_url=`${baseUrl(req)}/share/${token}`
  const item=await repo_addShared(email,{title,date,time_slot,token,share_url})
  res.json({success:true,item})
})
app.delete('/api/shared/:id', requireAuth, async (req,res)=>{ const email=(req.session.user||req.user)?.email||'guest@guest.local'; await repo_delShared(email,req.params.id); res.json({success:true}) })

app.get('/api/share/:token', async (req,res)=>{ const hit=await repo_getSharedByToken(req.params.token); if(!hit) return res.status(404).json({error:'not_found'}); const {id,title,date,time_slot,created_by,created_at}=hit; res.json({id,title,date,time_slot,created_by,created_at}) })

app.get('/api/events', requireAuth, async (req,res)=>{ const email=(req.session.user||req.user)?.email||'guest@guest.local'; res.json(await repo_listEvents(email)) })
app.post('/api/events', requireAuth, async (req,res)=>{ const email=(req.session.user||req.user)?.email||'guest@guest.local'; const {title,date}=req.body; const item=await repo_addEvent(email,{title,date}); res.json({success:true,item}) })
app.delete('/api/events/:id', requireAuth, async (req,res)=>{ const email=(req.session.user||req.user)?.email||'guest@guest.local'; await repo_delEvent(email,req.params.id); res.json({success:true}) })

// static
const distPath = path.join(__dirname,'../frontend-dist')
app.use(express.static(distPath))
app.get('*', (_req,res)=> res.sendFile(path.join(distPath,'index.html')))
app.listen(PORT,()=>console.log('Server running on port',PORT))