import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

// === DB bootstrap ===
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
let hasPG = false;
let pool = null;

if (DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: DATABASE_URL.includes('railway') || DATABASE_URL.includes('render') || DATABASE_URL.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    });
    hasPG = true;
  } catch (e) {
    console.error('[DB] init failed:', e);
    hasPG = false;
    pool = null;
  }
}

async function ensureSchema() {
  try {
    if (!hasPG || !pool) {
      console.warn('[DB] no database configured. schema init skipped.');
      return;
    }
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
        token TEXT NOT NULL REFERENCES shared_sessions(token) ON DELETE CASCADE,
        date DATE NOT NULL,
        time_slot TEXT NOT NULL,
        member_name TEXT NOT NULL,
        memo TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  } catch (e) {
    console.error('[DB] migration error', e);
  }
}

// === App ===
const app = express();
app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend')));

function normalizeDatesFromBody(body) {
  const out = new Set();
  const push = (s) => {
    if (typeof s !== 'string') return;
    const t = s.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) out.add(t);
  };
  if (Array.isArray(body?.allowed_dates)) body.allowed_dates.forEach(push);
  else if (typeof body?.allowed_dates === 'string') body.allowed_dates.split(',').forEach(push);
  if (Array.isArray(body?.selectedDates)) body.selectedDates.forEach(push);
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
  if (typeof body?.d === 'string') push(body.d);
  return Array.from(out).sort();
}

function jstTodayISO() {
  const jpNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const y = jpNow.getFullYear();
  const m = String(jpNow.getMonth() + 1).padStart(2, '0');
  const d = String(jpNow.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ----- Shared session APIs -----
app.post('/api/shared/session', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error: 'no_db' });
    const { title = '共有スケジュール' } = req.body || {};
    let allowed = normalizeDatesFromBody(req.body);
    if (allowed.length === 0) {
      allowed = [jstTodayISO()];
      console.warn('[shared_session] allowed_dates empty – fallback to today (JST):', allowed[0]);
    }
    const token = [...Array(24)].map(() => Math.random().toString(36)[2]).join('');
    await pool.query(
      'INSERT INTO shared_sessions (token,title,allowed_dates) VALUES ($1,$2,$3)',
      [token, title, JSON.stringify(allowed)]
    );
    const base = process.env.PUBLIC_ORIGIN ? process.env.PUBLIC_ORIGIN : '';
    res.json({ token, url: base + '/share_session.html?token=' + token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'issue_failed' });
  }
});

app.get('/api/shared/session/:token', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error: 'no_db' });
    const { rows } = await pool.query(
      'SELECT token,title,allowed_dates,created_at FROM shared_sessions WHERE token=$1',
      [req.params.token]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'get_failed' });
  }
});

app.get('/api/shared/session/:token/events', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error: 'no_db' });
    const { rows } = await pool.query(
      'SELECT id, token, date, time_slot, member_name, memo, created_at FROM shared_events WHERE token=$1 ORDER BY date ASC, member_name ASC',
      [req.params.token]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'list_failed' });
  }
});

function isValidTimeSlot(ts) {
  if (['x', 'am', 'pm', 'allday'].includes(ts)) return true;
  return /^time:\d{2}:\d{2}-\d{2}:\d{2}$/.test(ts);
}

app.post('/api/shared/session/:token/register', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error: 'no_db' });
    const token = req.params.token;
    const { date, time_slot, member_name, memo = null } = req.body || {};
    if (!token || !date || !time_slot || !member_name) return res.status(400).json({ error: 'bad_request' });
    if (!isValidTimeSlot(time_slot)) return res.status(400).json({ error: 'invalid_time_slot' });

    const s = await pool.query('SELECT allowed_dates FROM shared_sessions WHERE token=$1', [token]);
    if (s.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    const allowed = (s.rows[0].allowed_dates || []);
    if (!allowed.includes(date)) return res.status(400).json({ error: 'date_not_allowed' });

    await pool.query(
      'INSERT INTO shared_events (token,date,time_slot,member_name,memo) VALUES ($1,$2,$3,$4,$5)',
      [token, date, time_slot, member_name, memo]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'insert_failed' });
  }
});

app.put('/api/shared/session/:token/events/:id', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error: 'no_db' });
    const { member_name, time_slot, memo = null } = req.body || {};
    if (!member_name || !isValidTimeSlot(time_slot)) return res.status(400).json({ error: 'bad_request' });
    const upd = await pool.query(
      'UPDATE shared_events SET time_slot=$1, memo=$2 WHERE id=$3 AND token=$4 AND member_name=$5',
      [time_slot, memo, req.params.id, req.params.token, member_name]
    );
    if (upd.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'update_failed' });
  }
});

app.delete('/api/shared/session/:token/events/:id', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error: 'no_db' });
    const { member_name } = req.body || {};
    if (!member_name) return res.status(400).json({ error: 'bad_request' });
    const del = await pool.query(
      'DELETE FROM shared_events WHERE id=$1 AND token=$2 AND member_name=$3',
      [req.params.id, req.params.token, member_name]
    );
    if (del.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'delete_failed' });
  }
});

// ----- Personal schedule -----
app.get('/api/personal', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error: 'no_db' });
    const user = (req.query.user || '').trim();
    const q = user
      ? 'SELECT * FROM personal_schedules WHERE user_name=$1 ORDER BY date ASC'
      : 'SELECT * FROM personal_schedules ORDER BY date ASC';
    const args = user ? [user] : [];
    const { rows } = await pool.query(q, args);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'list_failed' }); }
});

app.post('/api/personal', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error: 'no_db' });
    const { user_name, date, time_slot, memo = null } = req.body || {};
    if (!user_name || !date || !time_slot) return res.status(400).json({ error: 'bad_request' });
    await pool.query(
      'INSERT INTO personal_schedules (user_name,date,time_slot,memo) VALUES ($1,$2,$3,$4)',
      [user_name, date, time_slot, memo]
    );
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'insert_failed' }); }
});

app.put('/api/personal/:id', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error: 'no_db' });
    const { user_name, time_slot, memo = null } = req.body || {};
    const id = req.params.id;
    if (!user_name || !time_slot) return res.status(400).json({ error: 'bad_request' });
    const upd = await pool.query(
      'UPDATE personal_schedules SET time_slot=$1, memo=$2 WHERE id=$3 AND user_name=$4',
      [time_slot, memo, id, user_name]
    );
    if (upd.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'update_failed' }); }
});

app.delete('/api/personal/:id', async (req, res) => {
  try {
    if (!hasPG || !pool) return res.status(501).json({ error: 'no_db' });
    const id = req.params.id;
    const { user_name } = req.body || {};
    if (!user_name) return res.status(400).json({ error: 'bad_request' });
    const del = await pool.query(
      'DELETE FROM personal_schedules WHERE id=$1 AND user_name=$2',
      [id, user_name]
    );
    if (del.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'delete_failed' }); }
});

await ensureSchema();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Server running on port', PORT));
