const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 静的ファイル提供
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL 接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ---------------------
// 共有予定
// ---------------------
app.get('/api/shared', async (req, res) => {
  const { date } = req.query;
  try {
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

// ---------------------
// 個人予定
// ---------------------
app.get('/api/personal/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { date } = req.query;
  try {
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

// React ルーティング用キャッチオール
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバー起動
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ サーバーがポート ${PORT} で起動しました`);
});
