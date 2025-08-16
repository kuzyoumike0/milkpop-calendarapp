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

function baseUrl(req){
  if(PUBLIC_BASE_URL) return PUBLIC_BASE_URL.replace(/\/$/,'')
  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

function makeGuest(){
  const rnd = Math.random().toString(36).slice(2,8)
  return { email:`guest_${rnd}@guest.local`, name:`Guest ${rnd}`, provider:'guest' }
}

// PostgreSQL
const hasPG=!!process.env.DATABASE_URL; let pool=null
async function safeExec(sql){ try{ await pool.query(sql) } catch(e){ /* ignore */ } }
async function migrate(){
  // users
  await safeExec(`create table if not exists users(
    id serial primary key,
    email text unique,
    name text,
    provider text,
    share_token text unique,
    external_id text,
    created_at timestamptz default now()
  );`)
  await safeExec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS share_token text unique;`)
  await safeExec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS external_id text;`)
  await safeExec(`CREATE INDEX IF NOT EXISTS idx_users_external_id ON users(external_id);`)

  // personal_events
  await safeExec(`create table if not exists personal_events(
    id serial primary key,
    user_id integer,
    date date not null,
    time_slot text not null,
    title text not null,
    memo text default '',
    created_at timestamptz default now()
  );`)

  // shared_events
  await safeExec(`create table if not exists shared_events(
    id serial primary key,
    user_id integer,
    date date not null,
    time_slot text not null,
    title text not null,
    member_name text,
    token text,
    created_at timestamptz default now()
  );`)
  await safeExec(`ALTER TABLE shared_events ADD COLUMN IF NOT EXISTS token text;`)
  await safeExec(`ALTER TABLE shared_events ADD COLUMN IF NOT EXISTS member_name text;`)

  // events
  await safeExec(`create table if not exists events(
    id serial primary key,
    user_id integer,
    title text not null,
    date date not null,
    created_at timestamptz default now()
  );`)

  // legacy columns rename
  await safeExec(`ALTER TABLE personal_events RENAME COLUMN create_at TO created_at;`)
  await safeExec(`ALTER TABLE shared_events RENAME COLUMN create_at TO created_at;`)
  await safeExec(`ALTER TABLE shared_events RENAME COLUMN create_by TO user_id;`)
  await safeExec(`ALTER TABLE events RENAME COLUMN create_at TO created_at;`)

  // ensure required columns exist
  await safeExec(`ALTER TABLE personal_events ADD COLUMN IF NOT EXISTS user_id integer;`)
  await safeExec(`ALTER TABLE shared_events ADD COLUMN IF NOT EXISTS user_id integer;`)
  await safeExec(`ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id integer;`)
  await safeExec(`ALTER TABLE personal_events ADD COLUMN IF NOT EXISTS memo text default '';`)
  await safeExec(`ALTER TABLE personal_events ADD COLUMN IF NOT EXISTS created_at timestamptz default now();`)
  await safeExec(`ALTER TABLE shared_events ADD COLUMN IF NOT EXISTS created_at timestamptz default now();`)
  await safeExec(`ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at timestamptz default now();`)

  await safeExec(`CREATE INDEX IF NOT EXISTS idx_shared_token ON shared_events(token);`)
  await safeExec(`CREATE INDEX IF NOT EXISTS idx_personal_user_date ON personal_events(user_id, date);`)
  await safeExec(`CREATE INDEX IF NOT EXISTS idx_shared_user_date ON shared_events(user_id, date);`)

  console.log('[DB] migrations ok (user_id schema)')
}
if(hasPG){
  pool=new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL==='false'?false:{rejectUnauthorized:false} })
  migrate().catch(e=>console.error('DB init error',e))
}

// users helpers
async function upsertUserByEmail({email,name,provider,provider_uid}){
  if(!hasPG){ // memory
    const id = Math.floor(Math.random()*1e9)
    const share_token = crypto.randomBytes(16).toString('hex')
    const external_id = provider_uid || crypto.randomBytes(8).toString('hex')
    return { id, email, name, provider, share_token, external_id }
  }
  const sel = await pool.query('select * from users where email=$1',[email])
  if(sel.rowCount>0){
    let user = sel.rows[0]
    if(!user.share_token){
      const tok=crypto.randomBytes(16).toString('hex')
      const upd=await pool.query('update users set share_token=$1 where id=$2 returning *',[tok,user.id])
      user = upd.rows[0]
    }
    if(!user.external_id){
      const ext = provider_uid || crypto.randomBytes(8).toString('hex')
      const upd2=await pool.query('update users set external_id=$1 where id=$2 returning *',[ext,user.id])
      user = upd2.rows[0]
    }
    return user
  } else {
    const tok=crypto.randomBytes(16).toString('hex')
    const ext = provider_uid || crypto.randomBytes(8).toString('hex')
    const ins=await pool.query('insert into users(email,name,provider,share_token,external_id) values($1,$2,$3,$4,$5) returning *',[email,name,provider,tok,ext])
    return ins.rows[0]
  }
}

// Passport
if (GID && GSECRET) {
  passport.use(new GoogleStrategy({ clientID:GID, clientSecret:GSECRET, callbackURL:GCALLBACK },
    async (accessToken,refreshToken,profile,done)=>{
      try{
        const email=(profile.emails&&profile.emails[0]&&profile.emails[0].value)||''
        const name=profile.displayName||''
        const user=await upsertUserByEmail({email,name,provider:'google',provider_uid: profile.id})
        done(null,{ user_id:user.id, email:user.email, name:user.name, provider:'google' })
      }catch(e){ done(e) }
    }))
}
if (TW_KEY && TW_SECRET) {
  passport.use(new TwitterStrategy({ consumerKey:TW_KEY, consumerSecret:TW_SECRET, callbackURL:TW_CALLBACK, includeEmail:true },
    async (token,tokenSecret,profile,done)=>{
      try{
        const username=profile.username||`tw-${profile.id}`
        const email=(profile.emails&&profile.emails[0]&&profile.emails[0].value)||`${username}@twitter.local`
        const name=profile.displayName||username
        const user=await upsertUserByEmail({email,name,provider:'twitter',provider_uid: profile.id})
        done(null,{ user_id:user.id, email:user.email, name:user.name, provider:'twitter' })
      }catch(e){ done(e) }
    }))
}
passport.serializeUser((u,d)=>d(null,u)); passport.deserializeUser((o,d)=>d(null,o))

function requireAuth(req,res,next){
  const u = req.session?.user || req.user
  if (u) return next()
  if (AUTH_MODE === 'disabled') { req.session.user = { ...makeGuest(), user_id: 0 }; return next() }
  if (AUTH_MODE === 'optional') return next()
  return res.status(401).json({ error:'auth_required' })
}
app.use((req,_res,next)=>{ if(req.user) req.session.user=req.user; next() })

// OAuth routes
app.get('/auth/google',(req,res,next)=>{ if(!(GID&&GSECRET)) return res.status(500).send('Google OAuth未設定'); return passport.authenticate('google',{scope:['profile','email']})(req,res,next)})
app.get('/auth/google/callback',(req,res,next)=>{ if(!(GID&&GSECRET)) return res.redirect('/login?err=oauth'); next() }, passport.authenticate('google',{failureRedirect:'/login?err=auth-failed',session:true}),(req,res)=>res.redirect(`/u/${(req.user && req.user.user_id) || '0'}`))
app.get('/auth/twitter',(req,res,next)=>{ if(!(TW_KEY&&TW_SECRET)) return res.status(500).send('Twitter OAuth未設定'); return passport.authenticate('twitter')(req,res,next)})
app.get('/auth/twitter/callback',(req,res,next)=>{ if(!(TW_KEY&&TW_SECRET)) return res.redirect('/login?err=twitter-oauth'); next() }, passport.authenticate('twitter',{failureRedirect:'/login?err=twitter-auth-failed',session:true}),(req,res)=>res.redirect(`/u/${(req.user && req.user.user_id) || '0'}`))
app.get('/auth/guest', async (req,res)=>{
  if(!hasPG){ req.session.user={...makeGuest(), user_id:0, provider:'guest'}; return res.redirect(`/u/0`) }
  const email = `guest_${crypto.randomBytes(4).toString('hex')}@guest.local`
  const user = await upsertUserByEmail({email,name:'Guest',provider:'guest',provider_uid: 'guest-' + crypto.randomBytes(6).toString('hex')})
  req.session.user={ user_id:user.id, email:user.email, name:user.name, provider:'guest' }
  return res.redirect(`/u/${user.id}`)
})
app.get('/auth/logout',(req,res)=>{ req.logout && req.logout(()=>{}); req.session.destroy(()=>res.redirect('/login')) })

// config / me
app.get('/api/config', async (_req,res)=>{
  const googleConfigured=Boolean(GID&&GSECRET), twitterConfigured=Boolean(TW_KEY&&TW_SECRET)
  res.json({ oauthConfigured: googleConfigured||twitterConfigured, googleConfigured, twitterConfigured, authMode: AUTH_MODE })
})
app.get('/api/me', async (req,res)=>{
  const u=req.session?.user||req.user; if(!u) return res.json({loggedIn:false,authMode:AUTH_MODE})
  return res.json({loggedIn:true,user_id:u.user_id,email:u.email,name:u.name,provider:u.provider||'oauth',authMode:AUTH_MODE})
})

// repo helpers with user_id
const mem={ personal:{}, shared:{}, events:{} }
async function listPersonal(uid){ if(hasPG){ const {rows}=await pool.query('select * from personal_events where user_id=$1 order by date asc,id asc',[uid]); return rows } return mem.personal[uid]||[] }
async function addPersonal(uid,{title,memo,date,time_slot}){ if(hasPG){ const {rows}=await pool.query('insert into personal_events(user_id,date,time_slot,title,memo) values($1,$2,$3,$4,$5) returning *',[uid,date,time_slot,title,memo]); return rows[0]} const item={id:String(Date.now())+Math.random().toString(36).slice(2,8),title,memo,date,time_slot,created_at:new Date().toISOString()}; mem.personal[uid]=(mem.personal[uid]||[]).concat([item]); return item }
async function delPersonal(uid,id){ if(hasPG){ await pool.query('delete from personal_events where id=$1 and user_id=$2',[id,uid]) } else { mem.personal[uid]=(mem.personal[uid]||[]).filter(x=>x.id!=id) } }
async function listShared(uid){ if(hasPG){ const {rows}=await pool.query('select * from shared_events where user_id=$1 order by date asc,id asc',[uid]); return rows } return mem.shared[uid]||[] }
async function addShared(uid,{title,date,time_slot,member_name}){ if(hasPG){ const {rows}=await pool.query('insert into shared_events(user_id,date,time_slot,title,member_name) values($1,$2,$3,$4,$5) returning *',[uid,date,time_slot,title,member_name]); return rows[0]} const item={id:String(Date.now())+Math.random().toString(36).slice(2,8),title,date,time_slot,user_id:uid,member_name,created_at:new Date().toISOString()}; mem.shared[uid]=(mem.shared[uid]||[]).concat([item]); return item }
async function delShared(uid,id){ if(hasPG){ await pool.query('delete from shared_events where id=$1 and user_id=$2',[id,uid]) } else { mem.shared[uid]=(mem.shared[uid]||[]).filter(x=>x.id!=id) } }
async function getShareItemsByToken(tok){ if(hasPG){ const u=await pool.query('select id from users where share_token=$1',[tok]); if(u.rowCount===0) return []; const uid=u.rows[0].id; const {rows}=await pool.query('select * from shared_events where user_id=$1 order by date asc,id asc',[uid]); return rows } return [] }
async function listEvents(uid){ if(hasPG){ const {rows}=await pool.query('select * from events where user_id=$1 order by date asc,id asc',[uid]); return rows } return mem.events[uid]||[] }
async function addEvent(uid,{title,date}){ if(hasPG){ const {rows}=await pool.query('insert into events(user_id,title,date) values($1,$2,$3) returning *',[uid,title,date]); return rows[0]} const item={id:String(Date.now())+Math.random().toString(36).slice(2,8),title,date,created_at:new Date().toISOString()}; mem.events[uid]=(mem.events[uid]||[]).concat([item]); return item }
async function delEvent(uid,id){ if(hasPG){ await pool.query('delete from events where id=$1 and user_id=$2',[id,uid]) } else { mem.events[uid]=(mem.events[uid]||[]).filter(x=>x.id!=id) } }

function uidFromReq(req){ const u=req.session?.user||req.user; return (u&&u.user_id)!=null ? u.user_id : 0 }

// APIs
app.get('/api/personal', requireAuth, async (req,res)=>{ const uid=uidFromReq(req); res.json(await listPersonal(uid)) })
app.post('/api/personal', requireAuth, async (req,res)=>{
  const uid=uidFromReq(req)
  const { title, memo='', date, time_slot, publish_to_shared=false } = req.body
  const item = await addPersonal(uid,{title,memo,date,time_slot})
  if(publish_to_shared){ await addShared(uid,{title,date,time_slot,member_name:'自分'}) }
  res.json({success:true,item})
})
app.delete('/api/personal/:id', requireAuth, async (req,res)=>{ const uid=uidFromReq(req); await delPersonal(uid,req.params.id); res.json({success:true}) })

app.get('/api/shared', requireAuth, async (req,res)=>{ const uid=uidFromReq(req); res.json(await listShared(uid)) })
app.post('/api/shared', requireAuth, async (req,res)=>{ const uid=uidFromReq(req); const { title, date, time_slot, member_name } = req.body; const item=await addShared(uid,{title,date,time_slot,member_name}); res.json({success:true,item}) })
app.delete('/api/shared/:id', requireAuth, async (req,res)=>{ const uid=uidFromReq(req); await delShared(uid,req.params.id); res.json({success:true}) })

// user-level share URL
app.get('/api/share/user', requireAuth, async (req,res)=>{
  if(!hasPG){ return res.json({ url: baseUrl(req) + '/share/u/demo' }) }
  const u=req.session?.user||req.user; if(!u || !u.user_id) return res.status(400).json({error:'no_user'})
  const row=await pool.query('select share_token from users where id=$1',[u.user_id]); if(row.rowCount===0) return res.status(404).json({error:'not_found'})
  const token=row.rows[0].share_token; res.json({ url: `${baseUrl(req)}/share/u/${token}` })
})
app.get('/api/share/user/:token', async (req,res)=>{ const items=await getShareItemsByToken(req.params.token); if(items.length===0) return res.status(404).json({error:'not_found'}); res.json(items) })

// static
const distPath = path.join(__dirname,'../frontend-dist')
app.use(express.static(distPath))
app.get('*', (_req,res)=> res.sendFile(path.join(distPath,'index.html')))
app.listen(PORT,()=>console.log('Server running on port',PORT))
