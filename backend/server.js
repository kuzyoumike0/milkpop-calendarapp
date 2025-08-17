// backend/server.js
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pkg from 'pg'
const { Pool } = pkg

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// DB
const hasPG = !!process.env.DATABASE_URL
const pool = hasPG ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === '0' ? false : { rejectUnauthorized: false }
}) : null

function baseUrl(req) {
  const fromEnv = process.env.PUBLIC_BASE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const host = req.get('host')
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
  return `${proto}://${host}`
}

function parseRange(slot) {
  if (slot === '×' || slot === '午前' || slot === '午後' || slot === '終日') return { ok: true, label: slot }
  const m = /^([0-2]?\d):([0-5]\d)-([0-2]?\d):([0-5]\d)$/.exec(slot)
  if (!m) return { ok: false }
  const s = Number(m[1])*60 + Number(m[2])
  let e = Number(m[3])*60 + Number(m[4])
  if (e === 0) e = 24*60
  return { ok: e > s, start: s, end: e }
}

async function migrate(){
  if (!hasPG) return
  const exec = (q,p)=>pool.query(q,p)
  await exec(`CREATE TABLE IF NOT EXISTS users(
    id serial PRIMARY KEY,
    provider text,
    external_id text,
    email text,
    name text,
    avatar text,
    share_token text,
    created_at timestamptz DEFAULT now(),
    session_secret text
  )`)
  await exec(`CREATE TABLE IF NOT EXISTS shared_sessions(
    id serial PRIMARY KEY,
    owner_user_id integer,
    token text UNIQUE,
    allowed_dates jsonb,
    mode text,
    title text,
    created_at timestamptz DEFAULT now()
  )`)
  await exec(`CREATE TABLE IF NOT EXISTS shared_events(
    id serial PRIMARY KEY,
    user_id integer,
    date date,
    time_slot text,
    title text,
    member_name text,
    created_by integer,
    token text,
    created_at timestamptz DEFAULT now()
  )`)
  await exec("ALTER TABLE shared_events ALTER COLUMN user_id TYPE integer USING NULLIF(user_id::text,'')::integer")
  await exec("ALTER TABLE shared_events ALTER COLUMN created_by TYPE integer USING NULLIF(created_by::text,'')::integer")
  await exec("UPDATE shared_events SET created_by = COALESCE(created_by, user_id) WHERE created_by IS NULL")
  await exec(`CREATE TABLE IF NOT EXISTS personal_events(
    id serial PRIMARY KEY,
    user_id integer,
    date date,
    time_slot text,
    title text,
    created_at timestamptz DEFAULT now()
  )`)
}
await migrate()

// Shared sessions
app.post('/api/shared/session', async (req,res)=>{
  const { dates = [], mode='multi', title='' } = req.body||{}
  if(!Array.isArray(dates) || dates.length===0) return res.status(400).json({error:'no_dates'})
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  if (hasPG){
    await pool.query('INSERT INTO shared_sessions(owner_user_id, token, allowed_dates, mode, title) VALUES ($1,$2,$3,$4,$5)',
      [1, token, JSON.stringify(dates), mode, title])
  }
  res.json({ url: baseUrl(req) + '/share_session.html?token=' + token, token })
})

app.get('/api/shared/session/:token', async (req,res)=>{
  if(!hasPG) return res.status(404).json({error:'not_found'})
  const { rows } = await pool.query('SELECT allowed_dates, mode, title FROM shared_sessions WHERE token=$1',[req.params.token])
  if(rows.length===0) return res.status(404).json({error:'not_found'})
  res.json({ allowed_dates: rows[0].allowed_dates||[], mode: rows[0].mode||'multi', title: rows[0].title||'' })
})

app.post('/api/shared/session/:token/register', async (req,res)=>{
  const { date, time_slot } = req.body||{}
  if(!date || !time_slot) return res.status(400).json({error:'bad_params'})
  const pr = parseRange(time_slot)
  if(!pr.ok) return res.status(400).json({error:'invalid_time_range_or_label'})
  if(!hasPG) return res.json({success:true})
  const srow = await pool.query('SELECT allowed_dates, owner_user_id FROM shared_sessions WHERE token=$1',[req.params.token])
  if(srow.rowCount===0) return res.status(404).json({error:'not_found'})
  const allowed = srow.rows[0].allowed_dates||[]
  if(!allowed.includes(date)) return res.status(400).json({error:'date_not_allowed'})
  const owner = srow.rows[0].owner_user_id || 1
  const ins = await pool.query('INSERT INTO shared_events(user_id,date,time_slot,title,member_name,created_by,token) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [owner, date, time_slot, '', '', owner, req.params.token])
  res.json({success:true, item: ins.rows[0]})
})

app.delete('/api/shared/:id', async (req,res)=>{
  const id = Number(req.params.id); if(!Number.isInteger(id)) return res.status(400).json({error:'bad_id'})
  if(!hasPG) return res.json({success:true})
  await pool.query('DELETE FROM shared_events WHERE id=$1',[id])
  res.json({success:true})
})

// Personal
app.get('/api/personal/:userId', async (req,res)=>{
  const uid = Number(req.params.userId); if(!Number.isInteger(uid)) return res.status(400).json({error:'bad_user'})
  if(!hasPG) return res.json([])
  const { rows } = await pool.query('SELECT * FROM personal_events WHERE user_id=$1 ORDER BY date ASC, id ASC',[uid])
  res.json(rows)
})

app.post('/api/personal', async (req,res)=>{
  const { user_id, date, time_slot, title } = req.body||{}
  if(!user_id || !date || !time_slot) return res.status(400).json({error:'bad_params'})
  const pr = parseRange(time_slot); if(!pr.ok) return res.status(400).json({error:'invalid_time_range_or_label'})
  if(!hasPG) return res.json({success:true})
  const ins = await pool.query('INSERT INTO personal_events(user_id,date,time_slot,title) VALUES ($1,$2,$3,$4) RETURNING *',
    [user_id, date, time_slot, title||''])
  res.json({success:true, item: ins.rows[0]})
})

// Static
app.use(express.static(path.join(__dirname, '../frontend')))
app.get('*', (_req,res)=>{
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

const PORT = process.env.PORT || 8080
app.listen(PORT, ()=> console.log('Server running on port', PORT))
