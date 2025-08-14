const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ここに /api/shared や /api/personal のルートを追加
app.listen(process.env.PORT || 8080, () => {
  console.log(`サーバー起動: ポート ${process.env.PORT || 8080}`);
});
