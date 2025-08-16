const path = require('path')
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const crypto = require('crypto')

const app = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', 1)
app.use(cors())
app.use(express.json())

// Cookie secure 切替
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
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || ''

function slugify(email){ return encodeURIComponent(email) }

if (GID && GSECRET) {
  passport.use(new GoogleStrategy(
    { clientID: GID, clientSecret: GSECRET, callbackURL: GCALLBACK },
    (accessToken, refreshToken, profile, done) => {
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || ''
      const name = profile.displayName || ''
      return done(null,{ email, name, slug: slugify(email) })
    }
  ))
}

passport.serializeUser((u,done)=>done(null,u))
passport.deserializeUser((o,done)=>done(null,o))

// OAuth routes
app.get('/auth/google', (req,res,next)=>{
  if(!(GID && GSECRET)) return res.status(500).send('Google OAuth未設定')
  return passport.authenticate('google', { scope:['profile','email'] })(req,res,next)
})
app.get('/auth/google/login', (req,res)=> res.redirect('/auth/google'))
app.get('/auth/google/callback',
  (req,res,next)=>{ if(!(GID && GSECRET)) return res.redirect('/login?err=oauth'); next() },
  passport.authenticate('google', { failureRedirect:'/login?err=failed', session:true }),
  (req,res)=>{
    // ユーザーごとのページへ遷移
    const slug = req.user.slug
    res.redirect(`/u/${slug}`)
  }
)
app.get('/auth/logout', (req,res)=>{
  req.logout && req.logout(()=>{})
  req.session.destroy(()=> res.redirect('/login') )
})

// Who am I
app.get('/api/me', (req,res)=>{
  const u = req.session?.user || req.user
  if(!u) return res.json({ loggedIn:false })
  return res.json({ loggedIn:true, email:u.email, name:u.name, slug:u.slug })
})

// Memory DB
let personal = {}  // email -> [ {id,title,memo,date,time_slot,created_at} ]
let shared = {}    // email -> [ {id,title,date,time_slot,created_by,created_at,token,share_url} ]

function requireAuth(req,res,next){
  if(req.session?.user || req.user) return next()
  return res.status(401).json({error:'auth_required'})
}
app.use((req,_res,next)=>{ if(req.user) req.session.user=req.user; next() })

function baseUrl(req){
  if(PUBLIC_BASE_URL) return PUBLIC_BASE_URL.replace(/\/$/,'')
  const proto = req.headers['x-forwarded-proto'] || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${proto}://${host}`
}

// Personal
app.get('/api/personal', requireAuth, (req,res)=>{
  const email = req.user.email
  res.json(personal[email] || [])
})
app.post('/api/personal', requireAuth, (req,res)=>{
  const email = req.user.email
  const { title, memo='', date, time_slot } = req.body
  const id = String(Date.now()) + Math.random().toString(36).slice(2,8)
  const created_at = new Date().toISOString()
  const item = { id, title, memo, date, time_slot, created_at }
  personal[email] = (personal[email] || []).concat([item])
  res.json({ success:true, item })
})
app.delete('/api/personal/:id', requireAuth, (req,res)=>{
  const email = req.user.email
  const { id } = req.params
  const list = personal[email] || []
  personal[email] = list.filter(x => x.id !== id)
  res.json({ success:true })
})

// Shared
app.get('/api/shared', requireAuth, (req,res)=>{
  const email = req.user.email
  res.json(shared[email] || [])
})
app.post('/api/shared', requireAuth, (req,res)=>{
  const email = req.user.email
  const { title, date, time_slot } = req.body
  const id = String(Date.now()) + Math.random().toString(36).slice(2,8)
  const created_at = new Date().toISOString()
  const token = crypto.randomBytes(16).toString('hex')
  const url = `${baseUrl(req)}/share/${token}`
  const item = { id, title, date, time_slot, created_by: email, created_at, token, share_url: url }
  shared[email] = (shared[email] || []).concat([item])
  res.json({ success:true, item })
})
app.delete('/api/shared/:id', requireAuth, (req,res)=>{
  const email = req.user.email
  const { id } = req.params
  const list = shared[email] || []
  shared[email] = list.filter(x => x.id !== id)
  res.json({ success:true })
})

// Public share
app.get('/api/share/:token', (req,res)=>{
  const t = req.params.token
  for (const email of Object.keys(shared)){
    const hit = (shared[email] || []).find(e => e.token === t)
    if(hit){
      const { id, title, date, time_slot, created_by, created_at } = hit
      return res.json({ id, title, date, time_slot, created_by, created_at })
    }
  }
  return res.status(404).json({ error:'not_found' })
})

// Static (built frontend)
const distPath = path.join(__dirname, '../frontend-dist')
app.use(express.static(distPath))
app.get('*', (_req,res)=> res.sendFile(path.join(distPath,'index.html')))

app.listen(PORT, ()=> console.log('Server running on port', PORT))
