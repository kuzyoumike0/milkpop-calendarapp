const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// DB 初期化
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      time_slot TEXT NOT NULL,
      title TEXT NOT NULL,
      username TEXT,
      memo TEXT
    );
  `);
})();

// 一覧取得
app.get('/api/schedules', async (req, res) => {
  const result = await pool.query('SELECT * FROM schedules ORDER BY date ASC');
  res.json(result.rows);
});

// 追加
app.post('/api/schedules', async (req, res) => {
  const { date, time_slot, title, username, memo } = req.body;
  const result = await pool.query(
    'INSERT INTO schedules (date, time_slot, title, username, memo) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [date, time_slot, title, username, memo]
  );
  res.json(result.rows[0]);
});

// 編集
app.put('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  const { date, time_slot, title, username, memo } = req.body;
  const result = await pool.query(
    'UPDATE schedules SET date=$1, time_slot=$2, title=$3, username=$4, memo=$5 WHERE id=$6 RETURNING *',
    [date, time_slot, title, username, memo, id]
  );
  res.json(result.rows[0]);
});

// 削除
app.delete('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM schedules WHERE id=$1', [id]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on ${PORT}`));