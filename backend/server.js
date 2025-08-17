
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pkg from 'pg'
const { Pool } = pkg

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
app.use(cors())
app.use(express.json())

// --- DB bootstrap ---
const hasPG = !!process.env.DATABASE_URL
const pool = hasPG ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL==='0'?false:{ rejectUnauthorized:false } }) : null

function uidFromReq(req){
  const u = req.headers['x-user-id']
  return u ? Number(u) : 1
}

function baseUrl(req){
  const fromEnv = process.env.PUBLIC_BASE_URL
  if(fromEnv) return fromEnv.replace(/\/$/, '')
  const host = req.get('host')
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
  return `${proto}://${host}`
}

// --- migrations ---
async function migrate(){
  if(!hasPG) return;
  const exec = (q) => pool.query(q);

  await exec(`CREATE TABLE IF NOT EXISTS users(
    id serial primary key,
    provider text,
    external_id text,
    email text,
    name text,
    avatar text,
    share_token text,
    created_at timestamptz default now(),
    session_secret text
  )`);

  await exec(`CREATE TABLE IF NOT EXISTS shared_sessions(
    id serial primary key,
    owner_user_id integer,
    token text unique,
    allowed_dates jsonb,
    mode text,
    title text,
    created_at timestamptz default now()
  )`);

  await exec(`CREATE TABLE IF NOT EXISTS shared_events(
    id serial primary key,
    user_id integer,
    date date,
    time_slot text,
    title text,
    member_name text,
    created_by integer,
    token text,
    created_at timestamptz default now()
  )`);

  await exec("ALTER TABLE shared_events ALTER COLUMN user_id TYPE integer USING NULLIF(user_id::text,'')::integer");
  await exec("ALTER TABLE shared_events ALTER COLUMN created_by TYPE integer USING NULLIF(created_by::text,'')::integer");
  await exec("UPDATE shared_events SET created_by = COALESCE(created_by, user_id) WHERE created_by IS NULL");

  await exec(`CREATE TABLE IF NOT EXISTS personal_events(
    id serial primary key,
    user_id integer,
    date date,
    time_slot text,
    title text,
    created_at timestamptz default now()
  )`);
}

await migrate()

// --- helpers ---
function pad(n){ return String(n).padStart(2,'0') }
function parseRange(slot){
  // accepts "HH:MM-HH:MM" or labels "×","午前","午後","終日"
  const labels = { "×": true, "午前": true, "午後": true, "終日": true }
  if(labels[slot]) return { ok: true, label: slot }
  const m = /^([0-2]?\d):([0-5]\d)-([0-2]?\d):([0-5]\d)$/.exec(slot)
  if(!m) return { ok:false }
  const s = Number(m[1])*60 + Number(m[2])
  const e = Number(m[3])*60 + Number(m[4])
  return { ok: e>s, start:s, end:e }
}

// --- memory fallback ---
let memId = 1
const memShared = []
const memSessions = new Map()

// --- API ---

// create share session
app.post('/api/shared/session', async (req,res)=>{
  const uid = uidFromReq(req)
  const { dates=[], mode='multi', title='' } = req.body || {}
  if(!Array.isArray(dates) || dates.length===0) return res.status(400).json({error:'no_dates'})
  const token = Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)
  if(hasPG){
    await pool.query('insert into shared_sessions(owner_user_id, token, allowed_dates, mode, title) values($1,$2,$3,$4,$5)',[uid, token, JSON.stringify(dates), mode, title])
  }else{
    memSessions.set(token,{allowed_dates:dates, mode, title, events:[]})
  }
  return res.json({ url: baseUrl(req) + '/share_session.html?token=' + token, token })
})

// session info
app.get('/api/shared/session/:token', async (req,res)=>{
  const tk = req.params.token
  if(hasPG){
    const srow = await pool.query('select * from shared_sessions where token=$1',[tk])
    if(srow.rowCount===0) return res.status(404).json({error:'not_found'})
    const allowed = srow.rows[0].allowed_dates || []
    const existing = (await pool.query('select id,date,time_slot,title,member_name,created_by from shared_events where token=$1 order by date asc, id asc',[tk])).rows
    return res.json({ allowed_dates: allowed, mode: srow.rows[0].mode||'multi', title: srow.rows[0].title || '', existing })
  } else {
    const ss = memSessions.get(tk)
    if(!ss) return res.status(404).json({error:'not_found'})
    return res.json({ allowed_dates: ss.allowed_dates, mode: ss.mode, title: ss.title, existing: ss.events })
  }
})

// register per token
app.post('/api/shared/session/:token/register', async (req,res)=>{
  const tk = req.params.token
  const { date, time_slot } = req.body || {}
  if(!date || !time_slot) return res.status(400).json({error:'bad_params'})
  const pr = parseRange(time_slot)
  if(!pr.ok) return res.status(400).json({error:'終了は開始より後を選んでください'})

  if(hasPG){
    const srow = await pool.query('select * from shared_sessions where token=$1',[tk])
    if(srow.rowCount===0) return res.status(404).json({error:'not_found'})
    const allowed = srow.rows[0].allowed_dates || []
    if(!allowed.includes(date)) return res.status(400).json({error:'date_not_allowed'})
    const owner = srow.rows[0].owner_user_id || 1
    const { rows } = await pool.query('insert into shared_events(user_id,date,time_slot,title,member_name,created_by,token) values($1,$2,$3,$4,$5,$6,$7) returning *',[owner, date, time_slot, '', '', owner, tk])
    return res.json({ success:true, item: rows[0] })
  }else{
    const ss = memSessions.get(tk)
    if(!ss) return res.status(404).json({error:'not_found'})
    if(!ss.allowed_dates.includes(date)) return res.status(400).json({error:'date_not_allowed'})
    const item = { id: memId++, date, time_slot, title:'', member_name:'' }
    ss.events.push(item)
    return res.json({ success:true, item })
  }
})

// delete shared event
app.delete('/api/shared/:id', async (req,res)=>{
  const id = Number(req.params.id)
  if(!Number.isInteger(id)) return res.status(400).json({error:'bad_id'})
  if(hasPG){
    await pool.query('delete from shared_events where id=$1',[id])
    return res.json({success:true})
  } else {
    let removed = false
    for(const [tk,ss] of memSessions.entries()){
      const before = ss.events.length
      ss.events = ss.events.filter(x=>x.id!==id)
      if(ss.events.length!==before) removed = true
    }
    for(let i=memShared.length-1;i>=0;i--){
      if(memShared[i].id===id){ memShared.splice(i,1); removed = true }
    }
    return res.json({success: removed})
  }
})

// personal events
app.get('/api/personal/:userId', async (req,res)=>{
  const uid = Number(req.params.userId)
  if(hasPG){
    const { rows } = await pool.query('select * from personal_events where user_id=$1 order by date asc, id asc',[uid])
    return res.json(rows)
  }else{
    return res.json([])
  }
})

app.post('/api/personal', async (req,res)=>{
  const { user_id, date, time_slot, title } = req.body || {}
  if(!user_id || !date || !time_slot) return res.status(400).json({error:'bad_params'})
  if(hasPG){
    const { rows } = await pool.query('insert into personal_events(user_id,date,time_slot,title) values($1,$2,$3,$4) returning *',[user_id, date, time_slot, title||''])
    return res.json({success:true, item: rows[0]})
  } else {
    return res.json({success:true})
  }
})

// static
app.use(express.static(path.join(__dirname, '../frontend')))
app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

const PORT = process.env.PORT || 8080
app.listen(PORT, ()=> console.log('Server running on port', PORT))
