
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

// --- Config ---
const EXPOSE_ERRORS = process.env.EXPOSE_ERRORS === 'true';
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const PORT = process.env.PORT || 8080;

let hasPG = false;
let pool = null;

if (DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: /railway|render|neon\.tech|supabase|azure|gcp|aws/.test(DATABASE_URL) ? { rejectUnauthorized: false } : false,
    });
    hasPG = true;
  } catch (e) {
    console.error('[DB] init failed:', e);
  }
}

// --- App ---
const app = express();
app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Utils ---
function jstTodayISO() {
  const jpNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const y = jpNow.getFullYear();
  const m = String(jpNow.getMonth() + 1).padStart(2, '0');
  const d = String(jpNow.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeDatesFromBody(body) {
  const out = new Set();
  const push = (s) => {
    if (typeof s !== 'string') return;
    const t = s.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) out.add(t);
  };
  if (Array.isArray(body?.allowed_dates)) body.allowed_dates.forEach(push);
  if (Array.isArray(body?.selectedDates)) body.selectedDates.forEach(push);
  if (typeof body?.d === 'string') push(body.d);
  const rng = body?.range;
  if (rng?.start && rng?.end) {
    const st = new Date(rng.start + 'T00:00:00Z');
    const en = new Date(rng.end + 'T00:00:00Z');
    if (!isNaN(st) && !isNaN(en) && st <= en) {
      for (let d = new Date(st); d <= en; d.setUTCDate(d.getUTCDate() + 1)) {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        out.add(`${y}-${m}-${dd}`);
      }
    }
  }
  return Array.from(out).sort();
}

function isValidTimeSlot(ts) {
  if (['x','am','pm','allday'].includes(ts)) return true;
  return /^time:\d{2}:\d{2}-\d{2}:\d{2}$/.test(ts);
}

// schema flag
let SHARED_EVENTS_HAS_TITLE = false;

// --- Schema ---
async function tableHasColumn(table, column) {
  if (!hasPG || !pool) return false;
  const sql = `
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=$1 AND column_name=$2
    LIMIT 1`;
  try {
    const { rows } = await pool.query(sql, [table, column]);
    return rows.length > 0;
  } catch {
    return false;
  }
}

async function ensureSchema() {
  if (!hasPG || !pool) {
    console.warn('[DB] no db configured');
    return;
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shared_sessions (
        token TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        allowed_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shared_events (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        time_slot TEXT NOT NULL,
        member_name TEXT,
        memo TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        token TEXT NOT NULL REFERENCES shared_sessions(token) ON DELETE CASCADE
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS personal_schedules (
        id SERIAL PRIMARY KEY,
        user_name TEXT NOT NULL,
        date DATE NOT NULL,
        time_slot TEXT NOT NULL,
        memo TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('[DB] migrations ok');
    SHARED_EVENTS_HAS_TITLE = await tableHasColumn('shared_events','title');
    console.log('[DB] shared_events.title exists =', SHARED_EVENTS_HAS_TITLE);
  } catch (e) {
    console.error('[DB] migration error', e);
  }
}

// --- Health ---
app.get('/api/health', async (req, res) => {
  if (!hasPG || !pool) return res.status(503).json({ ok:false, db:false, reason:'no_db' });
  try {
    const r = await pool.query('SELECT now() as now');
    res.json({ ok:true, db:true, now:r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok:false, db:false, ...(EXPOSE_ERRORS ? { message:e.message, code:e.code } : {}) });
  }
});

// --- Shared session ---
app.post('/api/shared/session', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error:'no_db' });
    const { title='共有スケジュール' } = req.body || {};
    let allowed = normalizeDatesFromBody(req.body);
    if (allowed.length === 0) allowed = [jstTodayISO()];
    const token = [...Array(24)].map(()=>Math.random().toString(36)[2]).join('');
    await pool.query('INSERT INTO shared_sessions (token,title,allowed_dates) VALUES ($1,$2,$3)', [token, title, JSON.stringify(allowed)]);
    const base = process.env.PUBLIC_ORIGIN || '';
    res.json({ token, url: base + '/share_session.html?token=' + token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'issue_failed', ...(EXPOSE_ERRORS ? { message:e.message, code:e.code } : {}) });
  }
});

app.get('/api/shared/session/:token', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error:'no_db' });
    const { rows } = await pool.query('SELECT token,title,allowed_dates,created_at FROM shared_sessions WHERE token=$1', [req.params.token]);
    if (!rows.length) return res.status(404).json({ error:'not_found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'get_failed' });
  }
});

app.get('/api/shared/session/:token/events', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error:'no_db' });
    const { rows } = await pool.query('SELECT id, date, time_slot, member_name, memo, created_at FROM shared_events WHERE token=$1 ORDER BY date ASC, member_name ASC', [req.params.token]);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'list_failed' });
  }
});

app.post('/api/shared/session/:token/register', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error:'no_db' });
    const token = req.params.token;
    const { date, time_slot, member_name, memo=null } = req.body || {};
    if (!date || !time_slot || !member_name) return res.status(400).json({ error:'bad_request' });
    if (!isValidTimeSlot(time_slot)) return res.status(400).json({ error:'invalid_time_slot' });

    const s = await pool.query('SELECT title, allowed_dates FROM shared_sessions WHERE token=$1', [token]);
    if (s.rowCount === 0) return res.status(404).json({ error:'not_found' });
    const sessionTitle = s.rows[0].title || '共有イベント';
    const allowed = s.rows[0].allowed_dates || [];
    if (!allowed.includes(date)) return res.status(400).json({ error:'date_not_allowed' });

    if (SHARED_EVENTS_HAS_TITLE) {
      await pool.query('ALTER TABLE shared_events ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT $1', [sessionTitle]);
      await pool.query('INSERT INTO shared_events (date,time_slot,member_name,memo,token,title) VALUES ($1,$2,$3,$4,$5,$6)', [date, time_slot, member_name, memo, token, sessionTitle]);
    } else {
      await pool.query('INSERT INTO shared_events (date,time_slot,member_name,memo,token) VALUES ($1,$2,$3,$4,$5)', [date, time_slot, member_name, memo, token]);
    }
    res.json({ success:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'insert_failed', ...(EXPOSE_ERRORS ? { message:e.message, code:e.code, detail:e.detail } : {}) });
  }
});

app.delete('/api/shared/session/:token/events/:id', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error:'no_db' });
    const { member_name } = req.body || {};
    if (!member_name) return res.status(400).json({ error:'bad_request' });
    const del = await pool.query('DELETE FROM shared_events WHERE id=$1 AND token=$2 AND member_name=$3', [req.params.id, req.params.token, member_name]);
    if (!del.rowCount) return res.status(404).json({ error:'not_found' });
    res.json({ success:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'delete_failed' });
  }
});

// --- Personal ---
app.get('/api/personal', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error:'no_db' });
    const user = (req.query.user || '').trim();
    const q = user ? 'SELECT * FROM personal_schedules WHERE user_name=$1 ORDER BY date ASC' : 'SELECT * FROM personal_schedules ORDER BY date ASC';
    const args = user ? [user] : [];
    const { rows } = await pool.query(q, args);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'list_failed' });
  }
});

app.post('/api/personal', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error:'no_db' });
    const { user_name, date, time_slot, memo=null } = req.body || {};
    if (!user_name || !date || !time_slot) return res.status(400).json({ error:'bad_request' });
    await pool.query('INSERT INTO personal_schedules (user_name,date,time_slot,memo) VALUES ($1,$2,$3,$4)', [user_name, date, time_slot, memo]);
    res.json({ success:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'insert_failed', ...(EXPOSE_ERRORS ? { message:e.message, code:e.code, detail:e.detail } : {}) });
  }
});

app.delete('/api/personal/:id', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error:'no_db' });
    const { user_name } = req.body || {};
    if (!user_name) return res.status(400).json({ error:'bad_request' });
    const del = await pool.query('DELETE FROM personal_schedules WHERE id=$1 AND user_name=$2', [req.params.id, user_name]);
    if (!del.rowCount) return res.status(404).json({ error:'not_found' });
    res.json({ success:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error:'delete_failed' });
  }
});

// --- Top & SPA files ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

await ensureSchema();
app.listen(PORT, () => console.log('Server running on port', PORT));
