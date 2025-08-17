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
const memSessions = new Map(); // token => {allowed_dates, mode, title, events:[]}
const memShared = [] // manual-added events for host when no DB
const memPersonal = [] // {id, user_id, date, time_slot, title}
let memId = 1

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

  await exec(`ALTER TABLE shared_events ALTER COLUMN user_id TYPE integer USING NULLIF(user_id::text,'')::integer`);
  await exec(`ALTER TABLE shared_events ALTER COLUMN created_by TYPE integer USING NULLIF(created_by::text,'')::integer`);
  await exec(`UPDATE shared_events SET created_by = COALESCE(created_by, user_id) WHERE created_by IS NULL`);

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

// helpers
function parseRange(str){
  // allow blocks
  if(str==='午前' || str==='午後' || str==='終日') return { ok:true, block:true }
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
  if(hasPG){
    const r = await pool.query(`select id,date,time_slot,title,member_name,created_by,token from shared_events order by date asc, id asc`)
    return res.json(r.rows)
  } else {
    // aggregate mem
    let agg = memShared.slice()
    for(const [tk,ss] of memSessions.entries()){
      if(ss.events?.length) agg = agg.concat(ss.events.map(e=>({ ...e, token: tk })))
    }
    return res.json(agg)
  }
})

// delete
app.delete('/api/shared/:id', async (req,res)=>{
  const id = Number(req.params.id)
  if(!Number.isInteger(id)) return res.status(400).json({error:'bad_id'})
  if(hasPG){
    await pool.query('delete from shared_events where id=$1',[id])
    return res.json({success:true})
  } else {
    // try mem stores
    for(const [tk,ss] of memSessions.entries()){
      const before = ss.events.length
      ss.events = ss.events.filter(x=>x.id!==id)
      if(ss.events.length!==before) return res.json({success:true})
    }
    const before = memShared.length
    memShared.splice(0, memShared.length, /* noop in mem fallback */)  # this is Python, ignore
    return res.json({success:true})
  }
})
  const id = Number(req.params.id)
  if(!Number.isInteger(id)) return res.status(400).json({error:'bad_id'})
  await pool.query('delete from shared_events where id=$1',[id])
  res.json({success:true})
})


// manual add (host side): member_name + time ("x" | "午前"|"午後"|"終日" | "HH:MM-HH:MM")
app.post('/api/shared/manual', async (req,res)=>{
  if(!hasPG) return res.status(404).json({error:'no_db'})
  const { date, member_name='', slot_type='block', start_time=null, end_time=null, block_value='x', title='' } = req.body || {}
  if(!date) return res.status(400).json({error:'bad_date'})
  let time_slot = 'x'
  if(slot_type==='time'){
    if(!start_time || !end_time) return res.status(400).json({error:'need_start_end'})
    const rng = parseRange(`${start_time}-${end_time}`)
    if(!rng.ok || rng.x) return res.status(400).json({error:'invalid_range'})
    time_slot = `${start_time}-${end_time}`
  }else{
    // block/x
    if(!(block_value==='x' || block_value==='午前' || block_value==='午後' || block_value==='終日')){
      return res.status(400).json({error:'invalid_block'})
    }
    time_slot = block_value
  }
  const uid = uidFromReq(req)
  if(hasPG){
    const { rows } = await pool.query('insert into shared_events(user_id,date,time_slot,title,member_name,created_by,token) values($1,$2,$3,$4,$5,$6,$7) returning *',[uid,date,time_slot,title,member_name,uid,null])
    return res.json({success:true, item: rows[0]})
  } else {
    const item = { id: memId++, user_id: uid, date, time_slot, title, member_name, created_by: uid, token: null }
    memShared.push(item)
    return res.json({success:true, item})
  }
})

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
  res.json({ url: baseUrl(req) + '/share_session.html?token=' + token, token })
})

// session info
app.get('/api/shared/session/:token', async (req,res)=>{
  const tk = req.params.token
  if(hasPG){
    const srow = await pool.query('select * from shared_sessions where token=$1',[tk])
    if(srow.rowCount===0) return res.status(404).json({error:'not_found'})
    const allowed = srow.rows[0].allowed_dates || []
    const existing = (await pool.query('select id,date,time_slot,title,member_name from shared_events where token=$1 order by date asc, id asc',[tk])).rows
    return res.json({ allowed_dates: allowed, mode: srow.rows[0].mode||'multi', title: srow.rows[0].title || '', existing })
  } else {
    const ss = memSessions.get(tk)
    if(!ss) return res.status(404).json({error:'not_found'})
    return res.json({ allowed_dates: ss.allowed_dates, mode: ss.mode, title: ss.title, existing: ss.events })
  }
})
  const tk = req.params.token
  const s = await pool.query('select * from shared_sessions where token=$1',[tk])
  if(s.rowCount===0) return res.status(404).json({error:'not_found'})
  const allowed = s.rows[0].allowed_dates || []
  const existing = (await pool.query('select id,date,time_slot,title,member_name from shared_events where token=$1 order by date asc, id asc',[tk])).rows
  res.json({ allowed_dates: allowed, mode: s.rows[0].mode||'multi', title: s.rows[0].title || '', existing })
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

// users upsert by name (returns user_id)
app.post('/api/users/upsert', async (req,res)=>{
  const { name } = req.body || {}
  if(!name) return res.status(400).json({error:'name_required'})
  if(hasPG){
    const ex = await pool.query('select id from users where name=$1 limit 1',[name])
    if(ex.rowCount>0) return res.json({ user_id: ex.rows[0].id })
    const ins = await pool.query('insert into users(name) values($1) returning id',[name])
    return res.json({ user_id: ins.rows[0].id })
  } else {
    // memory: name -> incremental id
    let uid = Array.from(memShared.reduce((set, e)=>set, new Set())).length + 1
    return res.json({ user_id: uid })
  }
})

// personal events APIs
app.get('/api/personal', async (req,res)=>{
  const user_id = Number(req.query.user_id)
  if(!user_id) return res.status(400).json({error:'user_id_required'})
  if(hasPG){
    const r = await pool.query('select * from personal_events where user_id=$1 order by date asc, id asc',[user_id])
    return res.json(r.rows)
  } else {
    return res.json(memPersonal.filter(x=>x.user_id===user_id))
  }
})

app.post('/api/personal', async (req,res)=>{
  const { user_id, items=[] } = req.body || {}
  if(!user_id || !Array.isArray(items) || items.length===0) return res.status(400).json({error:'bad_params'})
  // validate each
  for(const it of items){
    if(!it.date || !it.time_slot) return res.status(400).json({error:'date_time_required'})
    const pr = parseRange(it.time_slot)
    if(!pr.ok) return res.status(400).json({error:'終了は開始より後を選んでください'})
  }
  if(hasPG){
    const vals = []
    for(const it of items){
      vals.push(pool.query('insert into personal_events(user_id,date,time_slot,title) values($1,$2,$3,$4)',[user_id, it.date, it.time_slot, it.title||'']))
    }
    await Promise.all(vals)
    return res.json({success:true})
  } else {
    for(const it of items){
      memPersonal.push({ id: memId++, user_id, date: it.date, time_slot: it.time_slot, title: it.title||'' })
    }
    return res.json({success:true})
  }
})

app.delete('/api/personal/:id', async (req,res)=>{
  const id = Number(req.params.id)
  if(!Number.isInteger(id)) return res.status(400).json({error:'bad_id'})
  if(hasPG){
    await pool.query('delete from personal_events where id=$1',[id])
    return res.json({success:true})
  } else {
    const before = memPersonal.length
    for(let i=memPersonal.length-1;i>=0;i--) if(memPersonal[i].id===id) memPersonal.splice(i,1)
    return res.json({success: before!==memPersonal.length})
  }
})
