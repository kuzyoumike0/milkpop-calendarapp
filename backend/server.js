const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// Session & middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth (optional if env provided)
const GID = process.env.GOOGLE_CLIENT_ID || '';
const GSECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GCALLBACK = process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback';

if (GID && GSECRET) {
  passport.use(new GoogleStrategy(
    { clientID: GID, clientSecret: GSECRET, callbackURL: GCALLBACK },
    function(accessToken, refreshToken, profile, done) {
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || '';
      const name = profile.displayName || '';
      const picture = (profile.photos && profile.photos[0] && profile.photos[0].value) || '';
      return done(null, { email, name, picture });
    }
  ));
}
passport.serializeUser((user, done)=> done(null, user));
passport.deserializeUser((obj, done)=> done(null, obj));

// Auth routes
app.get('/auth/google/login', (req, res, next) => {
  if (!(GID && GSECRET)) return res.redirect('/auth/mock');
  passport.authenticate('google', { scope: ['profile','email'] })(req,res,next);
});
app.get('/auth/google/callback',
  (req,res,next)=>{
    if (!(GID && GSECRET)) return res.redirect('/auth/mock');
    next();
  },
  passport.authenticate('google', { failureRedirect: '/', session: true }),
  (req,res)=>{
    // req.user is set by passport
    req.session.user = req.user;
    res.redirect('/');
  }
);
app.get('/auth/mock', (req,res)=>{
  // Dev fallback to avoid setup errors
  req.session.user = { email: 'demo@example.com', name: 'Demo User', picture: '' };
  res.redirect('/');
});
app.get('/auth/logout', (req,res)=>{
  req.logout && req.logout(()=>{});
  req.session.destroy(()=>{
    res.redirect('/');
  });
});

// Current user
app.get('/api/me', (req,res)=>{
  const u = req.session && req.session.user;
  if (!u) return res.json({ loggedIn:false });
  return res.json({ loggedIn:true, email:u.email, name:u.name, picture:u.picture });
});

// In-memory DB
let personalEvents = []; // { id, user, title, memo, date, time_slot, created_at }
let sharedEvents = [];   // { id, title, date, time_slot, created_by, created_at }

// Auth guard
function requireAuth(req, res, next){
  try{
    if (req.session && req.session.user && req.session.user.email) return next();
    return res.status(401).json({ error:'auth_required' });
  }catch(e){ return res.status(401).json({ error:'auth_required' }); }
}

// Personal (user scoped)
app.get('/api/personal', requireAuth, (req,res)=>{
  const email = req.session.user.email;
  const rows = personalEvents.filter(e => e.user === email);
  res.json(rows);
});
app.post('/api/personal', requireAuth, (req,res)=>{
  const { title, memo = '', date, time_slot } = req.body;
  const user = req.session.user.email;
  const id = String(Date.now()) + Math.random().toString(36).slice(2,8);
  const created_at = new Date().toISOString();
  const item = { id, user, title, memo, date, time_slot, created_at };
  personalEvents.push(item);
  res.json({ success:true, item });
});
app.delete('/api/personal/:id', requireAuth, (req,res)=>{
  const email = req.session.user.email;
  const { id } = req.params;
  const before = personalEvents.length;
  personalEvents = personalEvents.filter(e => !(e.id === id && e.user === email));
  const removed = before !== personalEvents.length;
  res.json({ success: removed });
});

// Shared (created_by scoped)
app.get('/api/shared', requireAuth, (req,res)=>{
  const email = req.session.user.email;
  const rows = sharedEvents.filter(e => e.created_by === email);
  res.json(rows);
});
app.post('/api/shared', requireAuth, (req,res)=>{
  const { title, date, time_slot } = req.body;
  const created_by = req.session.user.email;
  const id = String(Date.now()) + Math.random().toString(36).slice(2,8);
  const created_at = new Date().toISOString();
  const item = { id, title, date, time_slot, created_by, created_at };
  sharedEvents.push(item);
  res.json({ success:true, item });
});
app.delete('/api/shared/:id', requireAuth, (req,res)=>{
  const email = req.session.user.email;
  const { id } = req.params;
  const before = sharedEvents.length;
  sharedEvents = sharedEvents.filter(e => !(e.id === id && e.created_by === email));
  const removed = before !== sharedEvents.length;
  res.json({ success: removed });
});

// Serve built frontend
const distPath = path.join(__dirname, '../frontend-dist');
app.use(express.static(distPath));
app.get('*', (_req,res)=> res.sendFile(path.join(distPath, 'index.html')));

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
