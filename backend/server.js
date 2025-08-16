const path = require('path')
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const crypto = require('crypto')

const app = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', 1)
app.use(cors())
app.use(express.json())

const AUTH_MODE = process.env.AUTH_MODE || 'required' // 'required' | 'optional' | 'disabled'
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
  const email = `guest_${rnd}@guest.local`
  const name = `Guest ${rnd}`
  const slug = slugify(email)
  return { email, name, slug, provider:'guest' }
}

if (GID && GSECRET) {
  passport.use(new GoogleStrategy(
    { clientID: GID, clientSecret: GSECRET, callbackURL: GCALLBACK },
    (accessToken, refreshToken, profile, done) => {
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || ''
      const name = profile.displayName || ''
      return done(null,{ email, name, slug: slugify(email), provider:'google' })
    }
  ))
}
if (TW_KEY && TW_SECRET) {
  passport.use(new TwitterStrategy(
    { consumerKey: TW_KEY, consumerSecret: TW_SECRET, callbackURL: TW_CALLBACK, includeEmail: true },
    (token, tokenSecret, profile, done) => {
      const username = profile.username || (profile._json && profile._json.screen_name) || `tw-${profile.id}`
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || `${username}@twitter.local`
      const name = profile.displayName || username
      return done(null,{ email, name, slug: slugify(email), provider:'twitter' })
    }
  ))
}

passport.serializeUser((u,done)=>done(null,u))
passport.deserializeUser((o,done)=>done(null,o))

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

// OAuth Routes
app.get('/auth/google', (req,res,next)=>{
  if(!(GID && GSECRET)) return res.status(500).send('Google OAuth未設定')
  return passport.authenticate('google', { scope:['profile','email'] })(req,res,next)
})
app.get('/auth/google/callback',
  (req,res,next)=>{ if(!(GID && GSECRET)) return res.redirect('/login?err=oauth'); next() },
  passport.authenticate('google', { failureRedirect:'/login?err=auth-failed', session:true }),
  (req,res)=> res.redirect(`/u/${req.user.slug}`)
)

app.get('/auth/twitter', (req,res,next)=>{
  if(!(TW_KEY && TW_SECRET)) return res.status(500).send('Twitter OAuth未設定')
  return passport.authenticate('twitter')(req,res,next)
})
app.get('/auth/twitter/callback',
  (req,res,next)=>{ if(!(TW_KEY && TW_SECRET)) return res.redirect('/login?err=twitter-oauth'); next() },
  passport.authenticate('twitter', { failureRedirect:'/login?err=twitter-auth-failed', session:true }),
  (req,res)=> res.redirect(`/u/${req.user.slug}`)
)

app.get('/auth/guest', (req,res)=>{
  if (AUTH_MODE === 'required') return res.redirect('/login?err=guest-disabled')
  req.session.user = makeGuest()
  return res.redirect(`/u/${req.session.user.slug}`)
})

app.get('/auth/logout', (req,res)=>{
  req.logout && req.logout(()=>{})
  req.session.destroy(()=> res.redirect('/login') )
})

// Config & Me
app.get('/api/config', (_req,res)=>{
  const googleConfigured = Boolean(GID && GSECRET)
  const twitterConfigured = Boolean(TW_KEY && TW_SECRET)
  res.json({ oauthConfigured: googleConfigured || twitterConfigured, googleConfigured, twitterConfigured, authMode: AUTH_MODE })
})
app.get('/api/me', (req,res)=>{
  const u = req.session?.user || req.user
  if(!u) return res.json({ loggedIn:false, authMode: AUTH_MODE })
  return res.json({ loggedIn:true, email:u.email, name:u.name, slug:u.slug, provider:u.provider || 'oauth', authMode: AUTH_MODE })
})

// In-memory DB by user
let personal = {}
let shared = {}

app.get('/api/personal', requireAuth, (req,res)=>{
  const email = (req.session.user || req.user).email
  res.json(personal[email] || [])
})
app.post('/api/personal', requireAuth, (req,res)=>{
  const email = (req.session.user || req.user).email
  const { title, memo='', date, time_slot } = req.body
  const id = String(Date.now()) + Math.random().toString(36).slice(2,8)
  const created_at = new Date().toISOString()
  const item = { id, title, memo, date, time_slot, created_at }
  personal[email] = (personal[email] || []).concat([item])
  res.json({ success:true, item })
})
app.delete('/api/personal/:id', requireAuth, (req,res)=>{
  const email = (req.session.user || req.user).email
  const { id } = req.params
  personal[email] = (personal[email] || []).filter(x=>x.id!==id)
  res.json({ success:true })
})

app.get('/api/shared', requireAuth, (req,res)=>{
  const email = (req.session.user || req.user).email
  res.json(shared[email] || [])
})
app.post('/api/shared', requireAuth, (req,res)=>{
  const email = (req.session.user || req.user).email
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
  const email = (req.session.user || req.user).email
  const { id } = req.params
  shared[email] = (shared[email] || []).filter(x=>x.id!==id)
  res.json({ success:true })
})

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

// Static
const distPath = path.join(__dirname, '../frontend-dist')
app.use(express.static(distPath))
app.get('*', (_req,res)=> res.sendFile(path.join(distPath,'index.html')))

app.listen(PORT, ()=> console.log('Server running on port', PORT))
