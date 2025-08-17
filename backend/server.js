const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 予定テーブル初期化
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      username TEXT,
      memo TEXT,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      title TEXT NOT NULL
    );
  `);
})();

// API
app.get('/api/schedules', async (req, res) => {
  const { date } = req.query;
  const result = await pool.query('SELECT * FROM schedules WHERE date=$1', [date]);
  res.json(result.rows);
});

app.post('/api/schedules', async (req, res) => {
  const { username, memo, date, timeslot, title } = req.body;
  const result = await pool.query(
    'INSERT INTO schedules (username, memo, date, timeslot, title) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [username, memo, date, timeslot, title]
  );
  res.json(result.rows[0]);
});

app.put('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  const { username, memo, date, timeslot, title } = req.body;
  const result = await pool.query(
    'UPDATE schedules SET username=$1,memo=$2,date=$3,timeslot=$4,title=$5 WHERE id=$6 RETURNING *',
    [username, memo, date, timeslot, title, id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM schedules WHERE id=$1', [id]);
  res.json({ success: true });
});

// 静的ファイル配信
app.use(express.static('public'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
