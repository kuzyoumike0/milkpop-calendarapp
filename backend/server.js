import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import pkg from 'pg'
const { Pool } = pkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// ==== DB init ====
let pool = null
let hasPG = false

try {
  const connStr =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ''
  if (connStr) {
    pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
    })
    await pool.query('select 1')
    hasPG = true
    console.log('[DB] connected')
  } else {
    console.warn('[DB] DATABASE_URL not set; running without DB')
  }
} catch (e) {
  console.warn('[DB] connect failed; running without DB:', e.message)
  pool = null
  hasPG = false
}

// ==== migrations (after hasPG decided) ====
if (hasPG && pool) {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS shared_sessions (
      id serial primary key,
      token text unique not null,
      title text,
      allowed_dates jsonb default '[]'::jsonb,
      created_at timestamptz default now()
    )`)
    await pool.query(`CREATE TABLE IF NOT EXISTS shared_events (
      id serial primary key,
      date date not null,
      time_slot text not null,
      member_name text not null,
      token text not null,
      memo text,
      created_at timestamptz default now()
    )`)
    await pool.query('ALTER TABLE IF EXISTS shared_events ADD COLUMN IF NOT EXISTS memo text')
    console.log('[DB] migrations ok')
  } catch (e) {
    console.warn('[DB] migrations failed:', e.message)
  }
}

// ===== API =====
// issue new share session
// issue new share session
app.post('/api/shared/session', async (req,res)=>{
  try{
    if(!hasPG || !pool) return res.status(501).json({error:'no_db'})
    const { title = '共有スケジュール' } = req.body || {}

    // ---- normalize dates (array/string/range/selectedDates/d) ----
    const out = new Set()
    const pushDate = (d)=>{
      if(typeof d !== 'string') return
      const s = d.trim()
      if(/^\d{4}-\d{2}-\d{2}$/.test(s)) out.add(s)
    }

    if(Array.isArray(req.body?.allowed_dates)){
      req.body.allowed_dates.forEach(pushDate)
    }else if(typeof req.body?.allowed_dates === 'string'){
      req.body.allowed_dates.split(',').forEach(pushDate)
    }

    if(Array.isArray(req.body?.selectedDates)){
      req.body.selectedDates.forEach(pushDate)
    }

    const rng = req.body?.range
    if(rng?.start && rng?.end){
      const start = new Date(rng.start + 'T00:00:00Z')
      const end   = new Date(rng.end   + 'T00:00:00Z')
      if(!isNaN(start) && !isNaN(end) && start <= end){
        for(let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate()+1)){
          const y = d.getUTCFullYear()
          const m = String(d.getUTCMonth()+1).padStart(2,'0')
          const dd= String(d.getUTCDate()).padStart(2,'0')
          out.add(`${y}-${m}-${dd}`)
        }
      }
    }

    if(typeof req.body?.d === 'string'){ pushDate(req.body.d) }

    let allowed = Array.from(out).sort()

    // ✅ 最終防御：空なら「日本時間の今日」を自動補完
    if (allowed.length === 0) {
      const jpNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
      const y = jpNow.getFullYear()
      const m = String(jpNow.getMonth()+1).padStart(2,'0')
      const d = String(jpNow.getDate()).padStart(2,'0')
      allowed = [`${y}-${m}-${d}`]
      console.warn('[shared_session] allowed_dates empty – fallback to today (JST):', allowed[0])
    }

    const token = [...Array(24)].map(()=>Math.random().toString(36)[2]).join('')
    await pool.query('INSERT INTO shared_sessions (token,title,allowed_dates) VALUES ($1,$2,$3)', [token, title, JSON.stringify(allowed)])
    const base = process.env.PUBLIC_ORIGIN ? process.env.PUBLIC_ORIGIN : ''
    res.json({ token, url: base + '/share_session.html?token=' + token })
  }catch(e){
    console.error(e); res.status(500).json({error:'issue_failed'})
  }
})

// health
app.get('/api/health', (_,res)=>{
  res.json({ ok: true, hasPG })
})


// get session meta (title, allowed_dates)
app.get('/api/shared/session/:token', async (req,res)=>{
  try{
    if(!hasPG || !pool) return res.status(501).json({error:'no_db'})
    const r = await pool.query('SELECT token,title,allowed_dates FROM shared_sessions WHERE token=$1',[req.params.token])
    if(r.rowCount===0) return res.status(404).json({error:'not_found'})
    res.json(r.rows[0])
  }catch(e){
    console.error(e); res.status(500).json({error:'fetch_session_failed'})
  }
})
// register
app.post('/api/shared/session/:token/register', async (req,res)=>{
  try{
    if(!hasPG || !pool) return res.status(501).json({error:'no_db'})
    const { date, time_slot, member_name, memo=null } = req.body || {}
    if(!date || !time_slot || !member_name) return res.status(400).json({error:'required'})
    await pool.query(
      'INSERT INTO shared_events (date,time_slot,member_name,token,memo) VALUES ($1,$2,$3,$4,$5)',
      [date, time_slot, member_name, req.params.token, memo]
    )
    res.json({ ok:true })
  }catch(e){
    console.error(e); res.status(500).json({error:'insert_failed'})
  }
})

// list events
app.get('/api/shared/session/:token/events', async (req,res)=>{
  try{
    if(!hasPG || !pool) return res.status(501).json({error:'no_db'})
    const r = await pool.query(
      'SELECT id,date,time_slot,member_name,memo FROM shared_events WHERE token=$1 ORDER BY date, member_name',
      [req.params.token]
    )
    res.json(r.rows)
  }catch(e){
    console.error(e); res.status(500).json({error:'fetch_failed'})
  }
})

// update own event
app.put('/api/shared/session/:token/events/:id', async (req,res)=>{
  try{
    if(!hasPG || !pool) return res.status(501).json({error:'no_db'})
    const { member_name='', time_slot='', memo=null } = req.body || {}
    if(!member_name || !time_slot) return res.status(400).json({error:'required'})
    const r = await pool.query(
      'UPDATE shared_events SET time_slot=$1, memo=$5 WHERE id=$2 AND token=$3 AND member_name=$4 RETURNING id,date,time_slot,member_name,memo',
      [time_slot, req.params.id, req.params.token, member_name, memo]
    )
    if(r.rowCount===0) return res.status(404).json({error:'not_found_or_not_owner'})
    res.json(r.rows[0])
  }catch(e){
    console.error(e); res.status(500).json({error:'update_failed'})
  }
})

// delete own event
app.delete('/api/shared/session/:token/events/:id', async (req,res)=>{
  try{
    if(!hasPG || !pool) return res.status(501).json({error:'no_db'})
    const { member_name='' } = req.body || {}
    if(!member_name) return res.status(400).json({error:'required'})
    const r = await pool.query(
      'DELETE FROM shared_events WHERE id=$1 AND token=$2 AND member_name=$3',
      [req.params.id, req.params.token, member_name]
    )
    if(r.rowCount===0) return res.status(404).json({error:'not_found_or_not_owner'})
    res.json({ ok:true })
  }catch(e){
    console.error(e); res.status(500).json({error:'delete_failed'})
  }
})

// static
app.use(express.static(path.join(__dirname, '../frontend')))
app.get('*', (_,res)=>res.sendFile(path.join(__dirname, '../frontend/index.html')))

const port = process.env.PORT || 8080
app.listen(port, ()=>console.log('Server running on port', port))
