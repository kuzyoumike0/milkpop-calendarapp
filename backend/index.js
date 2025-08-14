// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config(); // .env から DATABASE_URL を読み込む

// Express アプリの作成
const app = express();

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // フロントビルドを配信

// PostgreSQL プール設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Raiway DB URL
  ssl: { rejectUnauthorized: false },
});

// 共有カレンダーのデータ登録
app.post('/api/shared', async (req, res) => {
  try {
    const { user, dayType, date } = req.body;
    const result = await pool.query(
      'INSERT INTO shared_events(username, day_type, date) VALUES($1, $2, $3) RETURNING *',
      [user, dayType, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 個人カレンダーのデータ登録
app.post('/api/personal', async (req, res) => {
  try {
    const { user, dayType, date } = req.body;
    const result = await pool.query(
      'INSERT INTO personal_events(username, day_type, date) VALUES($1, $2, $3) RETURNING *',
      [user, dayType, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// サーバー起動
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`ポート${PORT}でサーバー起動`);
});
