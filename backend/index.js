const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 共有カレンダー取得
app.get('/api/shared', async (req, res) => {
  const result = await pool.query('SELECT * FROM shared_calendar ORDER BY date, period');
  res.json(result.rows);
});

// 個人カレンダー取得
app.get('/api/personal/:userId', async (req, res) => {
  const { userId } = req.params;
  const result = await pool.query(
    `SELECT p.*, s.date, s.period, s.title
     FROM personal_calendar p
     JOIN shared_calendar s ON p.shared_id = s.id
     WHERE p.user_id = $1
     ORDER BY s.date, s.period`,
    [userId]
  );
  res.json(result.rows);
});

// 共有カレンダー追加
app.post('/api/shared', async (req, res) => {
  const { date, period, title } = req.body;
  const result = await pool.query(
    'INSERT INTO shared_calendar (date, period, title) VALUES ($1, $2, $3) RETURNING *',
    [date, period, title]
  );
  res.json(result.rows[0]);
});

// 個人カレンダー追加
app.post('/api/personal', async (req, res) => {
  const { user_id, shared_id, note } = req.body;
  const result = await pool.query(
    'INSERT INTO personal_calendar (user_id, shared_id, note) VALUES ($1, $2, $3) RETURNING *',
    [user_id, shared_id, note]
  );
  res.json(result.rows[0]);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
