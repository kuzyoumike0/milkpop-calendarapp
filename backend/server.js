const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Optional DB connection (Railway)
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// In-memory fallback to avoid runtime errors
const memory = new Map();

// Create share
app.post('/api/share', async (req, res) => {
  const shareId = uuidv4();
  const { title, date, time_mode, slot, start_time, end_time } = req.body || {};

  // store in memory always for safety
  memory.set(shareId, { share_id: shareId, title, date, time_mode, slot, start_time, end_time, created_at: new Date().toISOString() });

  // try DB insert if available; ignore errors
  if (pool) {
    try {
      await pool.query(
        'INSERT INTO shared_events (share_id, title, event_date, time_mode, slot, start_time, end_time) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [shareId, title || null, date || null, time_mode || null, slot || null, start_time || null, end_time || null]
      );
    } catch(e) {
      console.warn('[DB insert skipped]', e.message);
    }
  }
  res.json({ link: `/shared/${shareId}` });
});

// Get share info
app.get('/api/share/:id', async (req, res) => {
  const id = req.params.id;
  if (memory.has(id)) return res.json(memory.get(id));
  if (pool) {
    try {
      const r = await pool.query('SELECT * FROM shared_events WHERE share_id=$1 LIMIT 1', [id]);
      if (r.rows[0]) return res.json(r.rows[0]);
    } catch(e) {
      console.warn('[DB select skipped]', e.message);
    }
  }
  return res.json({ share_id: id });
});

// Register response
app.post('/api/share/:id/register', async (req, res) => {
  const id = req.params.id;
  const { username, memo, time_mode, slot, start_time, end_time } = req.body || {};
  const key = `resp:${id}:${uuidv4()}`;
  memory.set(key, { share_id: id, username, memo, time_mode, slot, start_time, end_time, created_at: new Date().toISOString() });

  if (pool) {
    try {
      await pool.query(
        'INSERT INTO shared_responses (share_id, username, memo, time_mode, slot, start_time, end_time) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [id, username || null, memo || null, time_mode || null, slot || null, start_time || null, end_time || null]
      );
    } catch(e) {
      console.warn('[DB insert response skipped]', e.message);
    }
  }
  res.json({ ok: true });
});

// Static hosting (copy frontend /dist to backend/public)
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
