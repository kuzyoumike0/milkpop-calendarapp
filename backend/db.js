const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway の接続URL
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
