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

// ---------------- Users (user_id) ----------------
const hasPG=!!process.env.DATABASE_URL; let pool=null
async function safeExec(sql){ try{ await pool.query(sql) }catch(e){} }
async function migrate(){
  await safeExec(`create table if not exists users(
    id serial primary key,
    provider text not null,
    external_id text not null,
    email text,
    name text,
    slug text,
    user_share_token text,
    created_at timestamptz default now()
  );`)
  await safeExec(`create unique index if not exists users_provider_external_idx on users(provider, external_id);`)
  // personal
  await safeExec(`create table if not exists personal_events(
    id serial primary key,
    user_id integer not null,
    date date not null,
    time_slot text not null,
    title text not null,
    memo text default '',
    created_at timestamptz default now()
  );`)
  // shared
  await safeExec(`create table if not exists shared_events(
    id serial primary key,
    user_id integer not null,
    date date not null,
    time_slot text not null,
    title text not null,
    token text not null,
    created_at timestamptz default now()
  );`)
  await safeExec(`create unique index if not exists shared_token_idx on shared_events(token);`)
  // events
  await safeExec(`create table if not exists events(
    id serial primary key,
    user_id integer not null,
    title text not null,
    date date not null,
    created_at timestamptz default now()
  );`)

  // 旧列対応（存在すれば user_id を追加）
  await safeExec(`ALTER TABLE personal_events ADD COLUMN IF NOT EXISTS user_id integer;`)
  await safeExec(`ALTER TABLE shared_events ADD COLUMN IF NOT EXISTS user_id integer;`)
  await safeExec(`ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id integer;`)

  // create_by -> user_id への移行（あれば user_id null の行を埋めない＝新規のみ user_id で動作）
  await safeExec(`ALTER TABLE shared_events RENAME COLUMN create_at TO created_at;`)
  await safeExec(`ALTER TABLE shared_events RENAME COLUMN create_by TO user_id;`)
  await safeExec(`ALTER TABLE personal_events RENAME COLUMN create_at TO created_at;`)

  console.log('[DB] migrations ok (user_id schema)')
}

if(hasPG){
  pool=new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL==='false'?false:{rejectUnauthorized:false} })
  migrate().catch(e=>console.error('DB init error',e))
}

// User helpers
async function getOrCreateUser(provider, externalId, email, name){
  if(!hasPG){
    // memory
    const id = Math.floor(Math.random()*1e9)
    return { id, provider, external_id: externalId, email, name, slug: String(id), user_share_token: crypto.randomBytes(12).toString('hex') }
  }
  const sel = await pool.query('select * from users where provider=$1 and external_id=$2 limit 1',[provider, externalId])
  if(sel.rows[0]) return sel.rows[0]
  const slug = null // set after insert using id
  const userToken = crypto.randomBytes(12).toString('hex')
  const ins = await pool.query('insert into users(provider,external_id,email,name,slug,user_share_token) values($1,$2,$3,$4,$5,$6) returning *',[provider,externalId,email,name,slug,userToken])
  const u = ins.rows[0]
  // set slug = id
  const upd = await pool.query('update users set slug=$1 where id=$2 returning *',[String(u.id), u.id])
  return upd.rows[0]
}
async function ensureGuest(req){
  const provider='guest'; const externalId=crypto.randomBytes(8).toString('hex')
  const email=null, name='Guest'
  const u = await getOrCreateUser(provider, externalId, email, name)
  req.session.user = { userId: u.id, provider: u.provider, slug: String(u.id) }
  return u
}
function requireAuth(req,res,next){
  const u = req.session?.user || req.user
  if (u) return next()
  if (AUTH_MODE === 'disabled' || AUTH_MODE === 'optional') return next()
  return res.status(401).json({ error:'auth_required' })
}
app.use((req,_res,next)=>{ if(req.user && req.user.userId){ req.session.user=req.user } next() })

// Passport strategies
if (GID && GSECRET) {
  passport.use(new GoogleStrategy({ clientID:GID, clientSecret:GSECRET, callbackURL:GCALLBACK },
    async (accessToken,refreshToken,profile,done)=>{
      try{
        const email=(profile.emails&&profile.emails[0]&&profile.emails[0].value)||null
        const name=profile.displayName||''
        const u = await getOrCreateUser('google', profile.id, email, name)
        return done(null,{ userId:u.id, provider:'google', slug:String(u.id), email:u.email, name:u.name })
      }catch(e){ return done(e) }
    }))
}
if (TW_KEY && TW_SECRET) {
  passport.use(new TwitterStrategy({ consumerKey:TW_KEY, consumerSecret:TW_SECRET, callbackURL:TW_CALLBACK, includeEmail:true },
    async (token,tokenSecret,profile,done)=>{
      try{
        const username=profile.username||`tw-${profile.id}`
        const email=(profile.emails&&profile.emails[0]&&profile.emails[0].value)||null
        const name=profile.displayName||username
        const u = await getOrCreateUser('twitter', profile.id, email, name)
        return done(null,{ userId:u.id, provider:'twitter', slug:String(u.id), email:u.email, name:u.name })
      }catch(e){ return done(e) }
    }))
}
passport.serializeUser((u,d)=>d(null,u)); passport.deserializeUser((o,d)=>d(null,o))

// OAuth routes
app.get('/auth/google',(req,res,next)=>{ if(!(GID&&GSECRET)) return res.status(500).send('Google OAuth未設定'); return passport.authenticate('google',{scope:['profile','email']})(req,res,next)})
app.get('/auth/google/callback',(req,res,next)=>{ if(!(GID&&GSECRET)) return res.redirect('/login?err=oauth'); next() }, passport.authenticate('google',{failureRedirect:'/login?err=auth-failed',session:true}),(req,res)=>{ req.session.user=req.user; res.redirect(`/u/${req.user.slug}`) })
app.get('/auth/twitter',(req,res,next)=>{ if(!(TW_KEY&&TW_SECRET)) return res.status(500).send('Twitter OAuth未設定'); return passport.authenticate('twitter')(req,res,next)})
app.get('/auth/twitter/callback',(req,res,next)=>{ if(!(TW_KEY&&TW_SECRET)) return res.redirect('/login?err=twitter-oauth'); next() }, passport.authenticate('twitter',{failureRedirect:'/login?err=twitter-auth-failed',session:true}),(req,res)=>{ req.session.user=req.user; res.redirect(`/u/${req.user.slug}`) })
app.get('/auth/guest', async (req,res)=>{ if(AUTH_MODE==='required') return res.redirect('/login?err=guest-disabled'); const u=await ensureGuest(req); return res.redirect(`/u/${u.id}`)})
app.get('/auth/logout',(req,res)=>{ req.logout && req.logout(()=>{}); req.session.destroy(()=>res.redirect('/login')) })

// config / me
app.get('/api/config', async (_req,res)=>{
  res.json({ googleConfigured:Boolean(GID&&GSECRET), twitterConfigured:Boolean(TW_KEY&&TW_SECRET), authMode: AUTH_MODE })
})
app.get('/api/me', async (req,res)=>{
  const u=req.session?.user
  if(!u){ return res.json({loggedIn:false,authMode:AUTH_MODE}) }
  return res.json({loggedIn:true,userId:u.userId,slug:String(u.userId),provider:u.provider||'guest',authMode:AUTH_MODE})
})

// Helpers for share URL per user
async function ensureUserShareToken(userId){
  if(!hasPG) return { token:'mem_'+userId, share_url:'' }
  const sel = await pool.query('select user_share_token from users where id=$1',[userId])
  if(!sel.rows[0]) throw new Error('user not found')
  let token = sel.rows[0].user_share_token
  if(!token){
    token = crypto.randomBytes(12).toString('hex')
    await pool.query('update users set user_share_token=$1 where id=$2',[token,userId])
  }
  return { token }
}

// repos using user_id
const mem = { personal:{}, shared:{}, events:{}, users:{}, userShareToken:{} }

async function repo_listPersonal(userId){
  if(hasPG){
    const {rows}=await pool.query('select * from personal_events where user_id=$1 order by date asc,id asc',[userId])
    return rows
  }
  return mem.personal[userId]||[]
}
async function repo_addPersonal(userId,{title,memo='',date,time_slot}){
  if(hasPG){
    const {rows}=await pool.query('insert into personal_events(user_id,date,time_slot,title,memo) values($1,$2,$3,$4,$5) returning *',[userId,date,time_slot,title,memo])
    return rows[0]
  }
  const item={id:String(Date.now())+Math.random().toString(36).slice(2),user_id:userId,title,memo,date,time_slot,created_at:new Date().toISOString()}
  mem.personal[userId]=(mem.personal[userId]||[]).concat([item]); return item
}
async function repo_delPersonal(userId,id){
  if(hasPG) await pool.query('delete from personal_events where id=$1 and user_id=$2',[id,userId])
  else mem.personal[userId]=(mem.personal[userId]||[]).filter(x=>String(x.id)!==String(id))
}
async function repo_listShared(userId){
  if(hasPG){
    const {rows}=await pool.query('select * from shared_events where user_id=$1 order by date asc,id asc',[userId])
    return rows
  }
  return mem.shared[userId]||[]
}
async function repo_addShared(userId,{title,date,time_slot,token,share_url}){
  if(hasPG){
    const {rows}=await pool.query('insert into shared_events(user_id,date,time_slot,title,token) values($1,$2,$3,$4,$5) returning *',[userId,date,time_slot,title,token])
    const item=rows[0]; item.share_url=share_url; return item
  }
  const item={id:String(Date.now())+Math.random().toString(36).slice(2),user_id:userId,title,date,time_slot,token,created_at:new Date().toISOString(),share_url}
  mem.shared[userId]=(mem.shared[userId]||[]).concat([item]); return item
}
async function repo_delShared(userId,id){
  if(hasPG) await pool.query('delete from shared_events where id=$1 and user_id=$2',[id,userId])
  else mem.shared[userId]=(mem.shared[userId]||[]).filter(x=>String(x.id)!==String(id))
}
async function repo_getSharedByToken(token){
  if(hasPG){
    const {rows}=await pool.query('select * from shared_events where token=$1 limit 1',[token])
    return rows[0]||null
  }
  for(const uid of Object.keys(mem.shared)){
    const it=(mem.shared[uid]||[]).find(e=>e.token===token); if(it) return it
  }
  return null
}
async function repo_listEvents(userId){
  if(hasPG){
    const {rows}=await pool.query('select * from events where user_id=$1 order by date asc,id asc',[userId])
    return rows
  }
  return mem.events[userId]||[]
}
async function repo_addEvent(userId,{title,date}){
  if(hasPG){
    const {rows}=await pool.query('insert into events(user_id,title,date) values($1,$2,$3) returning *',[userId,title,date])
    return rows[0]
  }
  const item={id:String(Date.now())+Math.random().toString(36).slice(2),user_id:userId,title,date,created_at:new Date().toISOString()}
  mem.events[userId]=(mem.events[userId]||[]).concat([item]); return item
}
async function repo_delEvent(userId,id){
  if(hasPG) await pool.query('delete from events where id=$1 and user_id=$2',[id,userId])
  else mem.events[userId]=(mem.events[userId]||[]).filter(x=>String(x.id)!==String(id))
}

// API
app.get('/api/personal', requireAuth, async (req,res)=>{
  let userId = req.session?.user?.userId
  if(!userId && AUTH_MODE!=='required'){ const u=await ensureGuest(req); userId=u.id }
  const items = await repo_listPersonal(userId)
  res.json(items)
})
app.post('/api/personal', requireAuth, async (req,res)=>{
  let userId = req.session?.user?.userId
  if(!userId && AUTH_MODE!=='required'){ const u=await ensureGuest(req); userId=u.id }
  const { title, memo='', date, time_slot, publish_to_shared=false } = req.body
  const item = await repo_addPersonal(userId,{title,memo,date,time_slot})
  if(publish_to_shared){
    const token=crypto.randomBytes(16).toString('hex')
    const share_url=`${baseUrl(req)}/share/${token}`
    await repo_addShared(userId,{title,date,time_slot,token,share_url})
  }
  res.json({success:true,item})
})
app.delete('/api/personal/:id', requireAuth, async (req,res)=>{
  let userId = req.session?.user?.userId
  if(!userId && AUTH_MODE!=='required'){ const u=await ensureGuest(req); userId=u.id }
  await repo_delPersonal(userId, req.params.id)
  res.json({success:true})
})

app.get('/api/shared', requireAuth, async (req,res)=>{
  let userId = req.session?.user?.userId
  if(!userId && AUTH_MODE!=='required'){ const u=await ensureGuest(req); userId=u.id }
  const items = await repo_listShared(userId)
  res.json(items)
})
app.post('/api/shared', requireAuth, async (req,res)=>{
  let userId = req.session?.user?.userId
  if(!userId && AUTH_MODE!=='required'){ const u=await ensureGuest(req); userId=u.id }
  const { title, date, time_slot } = req.body
  const token=crypto.randomBytes(16).toString('hex')
  const share_url=`${baseUrl(req)}/share/${token}`
  const item=await repo_addShared(userId,{title,date,time_slot,token,share_url})
  res.json({success:true,item})
})
app.delete('/api/shared/:id', requireAuth, async (req,res)=>{
  let userId = req.session?.user?.userId
  if(!userId && AUTH_MODE!=='required'){ const u=await ensureGuest(req); userId=u.id }
  await repo_delShared(userId, req.params.id)
  res.json({success:true})
})

// Per-item public
app.get('/api/share/:token', async (req,res)=>{
  const hit=await repo_getSharedByToken(req.params.token); if(!hit) return res.status(404).json({error:'not_found'}); res.json(hit)
})
// Per-user share page
app.get('/api/share-url', async (req,res)=>{
  let userId = req.session?.user?.userId
  if(!userId && AUTH_MODE!=='required'){ const u=await ensureGuest(req); userId=u.id }
  if(!hasPG) return res.json({ share_url: `${baseUrl(req)}/p/mem_${userId}` })
  const { token } = await ensureUserShareToken(userId)
  res.json({ share_url: `${baseUrl(req)}/p/${token}` })
})
app.get('/api/public/user/:token', async (req,res)=>{
  if(!hasPG){
    const token=req.params.token; const userId = token.startsWith('mem_') ? token.replace('mem_','') : null
    const items = userId ? (mem.shared[userId]||[]) : []
    return res.json(items)
  }
  const sel = await pool.query('select id from users where user_share_token=$1 limit 1',[req.params.token])
  if(!sel.rows[0]) return res.status(404).json({error:'not_found'})
  const userId = sel.rows[0].id
  const { rows } = await pool.query('select * from shared_events where user_id=$1 order by date asc,id asc',[userId])
  res.json(rows)
})

// static
const distPath = path.join(__dirname,'../frontend-dist')
app.use(express.static(distPath))
app.get('*', (_req,res)=> res.sendFile(path.join(distPath,'index.html')))

app.listen(PORT,()=>console.log('Server running on port',PORT))
