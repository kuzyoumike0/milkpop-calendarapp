const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway で設定される環境変数
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
