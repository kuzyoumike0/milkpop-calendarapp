// backend/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // フロントビルド配信

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// --- 共有カレンダー ---
// 登録
app.post('/api/shared', async (req, res) => {
  try {
    const { title, time_slot, created_by, date } = req.body;
    const result = await pool.query(
      'INSERT INTO shared_events(date,time_slot,title,created_by,created_at) VALUES($1,$2,$3,$4,NOW()) RETURNING *',
      [date, time_slot, title, created_by]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 取得
app.get('/api/shared', async (req, res) => {
  try {
    const { date } = req.query;
    const result = await pool.query(
      'SELECT * FROM shared_events WHERE date=$1 ORDER BY time_slot',
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 削除
app.delete('/api/shared/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM shared_events WHERE id=$1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: '削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- 個人カレンダー ---
// 登録
app.post('/api/personal', async (req, res) => {
  try {
    const { title, time_slot, user_id, date } = req.body;
    const result = await pool.query(
      'INSERT INTO personal_events(user_id,date,time_slot,title,created_at) VALUES($1,$2,$3,$4,NOW()) RETURNING *',
      [user_id, date, time_slot, title]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 取得
app.get('/api/personal', async (req, res) => {
  try {
    const { user_id, date } = req.query;
    const result = await pool.query(
      'SELECT * FROM personal_events WHERE user_id=$1 AND date=$2 ORDER BY time_slot',
      [user_id, date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 削除
app.delete('/api/personal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM personal_events WHERE id=$1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: '削除しました', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- サーバー起動 ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`ポート${PORT}でサーバー起動`));
