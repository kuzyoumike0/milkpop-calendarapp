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

const DATABASE_URL = process.env.DATABASE_URL || ''
const hasPG = !!DATABASE_URL

const pool = hasPG ? new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false }
}) : null

function baseUrl(req){
  const fromEnv = process.env.PUBLIC_BASE_URL
  if(fromEnv) return fromEnv.replace(/\/$/, '')
  const host = req.get('host')
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
  return `${proto}://${host}`
}

// --- migrations ---
async function migrate(){
  if(!hasPG) return
  const client = await pool.connect()
  const exec = (q)=> client.query(q).catch(e=>console.warn('[migrate warn]', e.message))
  try{
    await exec(`create table if not exists users(
      id serial primary key,
      name text,
      email text,
      created_at timestamptz default now()
    )`)

    await exec(`create table if not exists shared_sessions(
      id serial primary key,
      owner_user_id integer,
      token text unique,
      allowed_dates jsonb,
      mode text,
      title text,
      created_at timestamptz default now()
    )`)

    await exec(`create table if not exists shared_events(
      id serial primary key,
      user_id integer,
      date date,
      time_slot text, -- 'x' or 'HH:MM-HH:MM'
      title text,
      member_name text,
      created_by integer,
      token text,
      created_at timestamptz default now()
    )`)

    // safety alters
    await exec(`alter table shared_events add column if not exists created_by integer`)
    await exec(`update shared_events set created_by = coalesce(created_by, user_id)`)
    await exec(`alter table shared_events alter column created_by drop not null`)
    await exec(`alter table shared_events add column if not exists token text`)
  } finally {
    client.release()
  }
}
await migrate()

// helpers
function parseRange(str){
  if(!str || str==='x') return { ok:true, x:true }
  const m = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(str)
  if(!m) return { ok:false }
  const s = parseInt(m[1],10)*60+parseInt(m[2],10)
  const e = parseInt(m[3],10)*60+parseInt(m[4],10)
  if(e<=s) return { ok:false }
  return { ok:true, s, e }
}

function uidFromReq(req){
  // optional login想定。ここではゲスト=1を固定採番に。
  return 1
}

// --- API ---

// list all shared items (for host page)
app.get('/api/shared', async (req,res)=>{
  if(!hasPG) return res.json([])
  const r = await pool.query(`select id,date,time_slot,title,member_name,created_by,token from shared_events order by date asc, id asc`)
  res.json(r.rows)
})

// delete
app.delete('/api/shared/:id', async (req,res)=>{
  if(!hasPG) return res.status(404).json({error:'no_db'})
  const id = Number(req.params.id)
  if(!Number.isInteger(id)) return res.status(400).json({error:'bad_id'})
  await pool.query('delete from shared_events where id=$1',[id])
  res.json({success:true})
})

// create share session
app.post('/api/shared/session', async (req,res)=>{
  if(!hasPG) return res.status(404).json({error:'no_db'})
  const uid = uidFromReq(req)
  const { dates=[], mode='multi', title='' } = req.body || {}
  if(!Array.isArray(dates) || dates.length===0) return res.status(400).json({error:'no_dates'})
  const token = Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)
  await pool.query('insert into shared_sessions(owner_user_id, token, allowed_dates, mode, title) values($1,$2,$3,$4,$5)',[uid, token, JSON.stringify(dates), mode, title])
  res.json({ url: baseUrl(req) + '/share_session.html?token=' + token, token })
})

// session info
app.get('/api/shared/session/:token', async (req,res)=>{
  if(!hasPG) return res.status(404).json({error:'no_db'})
  const tk = req.params.token
  const s = await pool.query('select * from shared_sessions where token=$1',[tk])
  if(s.rowCount===0) return res.status(404).json({error:'not_found'})
  const allowed = s.rows[0].allowed_dates || []
  const existing = (await pool.query('select id,date,time_slot,title,member_name from shared_events where token=$1 order by date asc, id asc',[tk])).rows
  res.json({ allowed_dates: allowed, mode: s.rows[0].mode||'multi', title: s.rows[0].title || '', existing })
})

// register per token
app.post('/api/shared/session/:token/register', async (req,res)=>{
  if(!hasPG) return res.status(404).json({error:'no_db'})
  const tk = req.params.token
  const { date, time_slot } = req.body || {}
  if(!date || !time_slot) return res.status(400).json({error:'bad_params'})
  // validate order if time range
  const pr = parseRange(time_slot)
  if(!pr.ok) return res.status(400).json({error:'終了は開始より後を選んでください'})
  // find session & owner
  const s = await pool.query('select * from shared_sessions where token=$1',[tk])
  if(s.rowCount===0) return res.status(404).json({error:'not_found'})
  const owner = s.rows[0].owner_user_id || 1
  // allowed check
  const allowed = s.rows[0].allowed_dates || []
  if(!allowed.includes(date)) return res.status(400).json({error:'date_not_allowed'})
  const { rows } = await pool.query('insert into shared_events(user_id,date,time_slot,title,member_name,created_by,token) values($1,$2,$3,$4,$5,$6,$7) returning *',[owner, date, time_slot, '', '', owner, tk])
  res.json({ success:true, item: rows[0] })
})

// ---- static
app.use(express.static(path.join(__dirname, '../frontend')))

app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'))
})

const PORT = process.env.PORT || 8080
app.listen(PORT, ()=> console.log('Server running on port', PORT))
