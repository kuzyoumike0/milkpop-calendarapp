
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT,10) : 8080;

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'mydb',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// List events for a shareId (optionally by date)
app.get('/api/shared/:shareId/events', async (req, res) => {
  try {
    const { shareId } = req.params;
    const { date } = req.query;

    let q = `SELECT id, event_date, title, slots, memo, created_at
             FROM shared_events WHERE share_id = $1`;
    const params = [shareId];

    if (date) {
      q += ` AND event_date = $2`;
      params.push(date);
    }
    q += ` ORDER BY event_date ASC, id ASC`;

    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed_to_fetch' });
  }
});

// Create event (public via shareId)
app.post('/api/shared/:shareId/events', async (req, res) => {
  try {
    const { shareId } = req.params;
    let { eventDate, title, slots, memo } = req.body;

    if (!eventDate) return res.status(400).json({ error: 'eventDate_required' });
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'title_required' });

    const ALLOW = new Set(['全日','朝','昼','夜','中締め']);
    if (!slots || (Array.isArray(slots) && slots.length === 0)) {
      slots = ['全日'];
    } else if (!Array.isArray(slots)) {
      slots = [String(slots)];
    }
    slots = Array.from(new Set(slots.filter(s => ALLOW.has(String(s))))); // unique & allow
    if (slots.length === 0) slots = ['全日'];

    const result = await pool.query(
      `INSERT INTO shared_events (share_id, event_date, title, slots, memo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, share_id, event_date, title, slots, memo, created_at`,
      [shareId, eventDate, title.trim(), slots, memo || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    if (e.code === '23514') return res.status(400).json({ error: 'invalid_slots' });
    if (e.code === '23502') return res.status(400).json({ error: 'missing_required' });
    res.status(500).json({ error: 'failed_to_insert' });
  }
});

// Delete event (optional)
app.delete('/api/shared/:shareId/events/:id', async (req, res) => {
  try {
    const { shareId, id } = req.params;
    await pool.query(
      `DELETE FROM shared_events WHERE share_id = $1 AND id = $2`,
      [shareId, id]
    );
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed_to_delete' });
  }
});

// Serve frontend (built files)
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
});
