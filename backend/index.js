const express = require('express');
const path = require('path');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// API例: 共有カレンダー取得
app.get('/api/shared', async (req, res) => {
  const { date } = req.query;
  const result = await pool.query(
    'SELECT * FROM shared_events WHERE date=$1 ORDER BY time_slot',
    [date]
  );
  res.json(result.rows);
});

// API例: 個人カレンダー取得
app.get('/api/personal', async (req, res) => {
  const { user_id, date } = req.query;
  const result = await pool.query(
    'SELECT * FROM personal_events WHERE user_id=$1 AND date=$2 ORDER BY time_slot',
    [user_id, date]
  );
  res.json(result.rows);
});

// 静的ファイル配信
app.use(express.static(path.join(__dirname, 'public')));

// React のルート
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバ起動
app.listen(process.env.PORT || 8080, () => {
  console.log(`サーバー起動: ポート ${process.env.PORT || 8080}`);
});
