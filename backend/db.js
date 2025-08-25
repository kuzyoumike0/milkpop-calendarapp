//pool.query(...) で SQL を実行するために必要らしい
// db.js (ESM)
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL, // 例: ...?sslmode=require
  ssl: { rejectUnauthorized: false },
});

export default pool;
