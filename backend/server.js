import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000*60*60*24 }
}));

// In-memory stores
let personalEvents = [];
let sharedEvents = [];
let events = [];
let seq = 1;

// --- OAuth2 ---
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || '',
  process.env.GOOGLE_CLIENT_SECRET || '',
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
);
const SCOPES = [
  'openid','email','profile','https://www.googleapis.com/auth/calendar.events'
];
function getAuthedClient(req){
  const c = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || '',
    process.env.GOOGLE_CLIENT_SECRET || '',
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
  );
  if (req.session.tokens) c.setCredentials(req.session.tokens);
  return c;
}

app.get('/auth/google/login', (req,res)=>{
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    include_granted_scopes: true
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req,res)=>{
  const { code } = req.query;
  if (!code) return res.redirect('/');
  try{
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = { ...req.session.tokens, ...tokens };
    oauth2Client.setCredentials(req.session.tokens);
    const oauth2 = google.oauth2({ version:'v2', auth: oauth2Client });
    const me = await oauth2.userinfo.get();
    req.session.user = { email: me.data.email, name: me.data.name, picture: me.data.picture };
    res.redirect('/shared');
  }catch(e){
    console.error('OAuth callback error', e);
    res.redirect('/');
  }
});

app.get('/auth/logout', (req,res)=>{
  req.session.destroy(()=>res.redirect('/'));
});

app.get('/api/me', (req,res)=>{
  res.json({ loggedIn: !!req.session.user, ...(req.session.user || {}) });
});

// --- Google Calendar API proxies ---
// List user's calendars
app.get('/api/google/calendars', async (req, res) => {
  try {
    const auth = getAuthedClient(req);
    const calendar = google.calendar({ version: 'v3', auth });
    const resp = await calendar.calendarList.list();
    res.json(resp.data); // {items:[{id, summary, primary, ...}]}
  } catch (e) {
    console.error('Calendars list error', e);
    res.status(401).json({ error: 'Auth required or API error' });
  }
});

app.get('/api/google/calendar/list', async (req,res)=>{
  try{
    const auth = getAuthedClient(req);
    const calendar = google.calendar({ version:'v3', auth });
    const { timeMin, timeMax, calendarId } = req.query;
    const resp = await calendar.events.list({
      calendarId: calendarId || 'primary',
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: timeMin || (new Date(Date.now()-3600*1000)).toISOString(),
      timeMax: timeMax || (new Date(Date.now()+7*24*3600*1000)).toISOString(),
      maxResults: 50
    });
    res.json(resp.data);
  }catch(e){
    console.error('Calendar list error', e);
    res.status(401).json({ error: 'Auth required or API error' });
  }
});

app.post('/api/google/calendar/create', async (req,res)=>{
  try{
    const auth = getAuthedClient(req);
    const calendar = google.calendar({ version:'v3', auth });
    const { summary, startISO, endISO, calendarId } = req.body;
    const event = { summary };
    if (startISO && endISO) {
      event.start = { dateTime: startISO };
      event.end = { dateTime: endISO };
    }
    const resp = await calendar.events.insert({ calendarId: calendarId || 'primary', requestBody: event });
    res.json(resp.data);
  }catch(e){
    console.error('Calendar create error', e);
    res.status(401).json({ error: 'Auth required or API error' });
  }
});

app.delete('/api/google/calendar/event/:id', async (req,res)=>{
  try{
    const auth = getAuthedClient(req);
    const calendar = google.calendar({ version:'v3', auth });
    await calendar.events.delete({ calendarId: calendarId || 'primary', eventId: req.params.id });
    res.json({ success: true });
  }catch(e){
    console.error('Calendar delete error', e);
    res.status(401).json({ error: 'Auth required or API error' });
  }
});

// --- App local data (existing features) ---
app.post('/api/personal', (req,res)=>{
  const { user, title, date, time_slot, memo } = req.body;
  const item = { id: String(seq++), user, title, date, time_slot, memo: memo || '', created_at: new Date().toISOString() };
  personalEvents.push(item);
  res.json({ success:true, item });
});
app.get('/api/personal', (req,res)=> { const u = (req.query.user||'').toString(); const rows = u ? personalEvents.filter(e=>e.user===u) : personalEvents; res.json(rows); });
app.delete('/api/personal/:id', (req,res)=>{ const { id } = req.params; personalEvents = personalEvents.filter(e=> e.id != id); res.json({ success:true }); });


app.post('/api/shared', (req,res)=>{
  const { title, date, time_slot, created_by } = req.body;
  const item = { id: String(seq++), title, date, time_slot, created_by, created_at: new Date().toISOString() };
  sharedEvents.push(item);
  res.json({ success:true, item });
});
app.get('/api/shared', (_req,res)=>{
  const merged = [
    ...sharedEvents,
    ...personalEvents.map(p => ({
      id: `p-${p.id}`,
      title: p.title, date: p.date, time_slot: p.time_slot,
      created_by: p.user, created_at: p.created_at
    }))
  ];
  res.json(merged);
});

app.post('/api/events', (req,res)=>{
  const { title, date } = req.body;
  const item = { id: String(seq++), title, date, created_at: new Date().toISOString() };
  events.push(item);
  res.json({ success:true, item });
});
app.get('/api/events', (_req,res)=> res.json(events));
app.delete('/api/events/:id', (req,res)=>{
  const { id } = req.params;
  events = events.filter(e => e.id != id);
  res.json({ success:true });
});

// static
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('*', (_req,res)=> res.sendFile(path.join(publicDir, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
