//pool.query(...) で SQL を実行するために必要らしい

import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway の環境変数
  ssl: {
    rejectUnauthorized: false, // Railway では必要な場合がある
  },
});
