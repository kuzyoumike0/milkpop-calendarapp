const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL 接続プール（Raiway 用）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Raiway は SSL 必須
  },
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL 接続成功'))
  .catch(err => {
    console.error('❌ PostgreSQL 接続エラー:', err);
    process.exit(1);
  });

// JSON 受け取り
app.use(express.json());

// サンプル API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Milkpop Calendar Backend!' });
});

// フロントエンド静的ファイル
app.use(express.static('public'));

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバー起動: ポート ${PORT}`);
});
