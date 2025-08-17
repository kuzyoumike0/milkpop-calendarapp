const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// === DB接続 ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 共有スケジュール保存
app.post('/api/shared', async (req, res) => {
  try {
    const { title, username, memo, start_time, end_time, date } = req.body;
    const shareId = uuidv4();
    await pool.query(
      'INSERT INTO shared_events (id, title, username, memo, start_time, end_time, date) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [shareId, title, username, memo, start_time, end_time, date]
    );
    res.json({ link: `/shared/${shareId}` });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

// 共有スケジュール取得
app.get('/api/shared/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shared_events WHERE id=$1', [req.params.id]);
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

// Reactのルーティング対応
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
