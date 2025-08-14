// 必要なモジュール読み込み
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Express アプリ作成
const app = express();

// ミドルウェア設定
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// PostgreSQLプール設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ===== ここに追加 =====
// 個人・共有カレンダーの POST 処理をここに書きます
app.post('/api/personal', async (req, res) => {
  const { user_id, date, time_slot, title } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO personal_events(user_id, date, time_slot, title, created_at) VALUES($1, $2, $3, $4, NOW()) RETURNING *',
      [user_id, date, time_slot, title]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shared', async (req, res) => {
  const { date, time_slot, title, created_by } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO shared_events(date, time_slot, title, created_by, created_at) VALUES($1, $2, $3, $4, NOW()) RETURNING *',
      [date, time_slot, title, created_by]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// ===== ここまで =====

// サーバー起動
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`ポート${PORT}でサーバー起動`);
});
