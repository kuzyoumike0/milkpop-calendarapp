const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL 接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Raiway PostgreSQL は SSL 接続が必要
  },
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL 接続成功'))
  .catch(err => {
    console.error('❌ PostgreSQL 接続エラー:', err);
    process.exit(1); // 接続できない場合はサーバーを停止
  });

// JSON を受け付ける設定
app.use(express.json());

// サンプル API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Milkpop Calendar Backend!' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバー起動: ポート ${PORT}`);
});
