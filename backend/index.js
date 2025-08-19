const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ===============================
// 起動時に init.sql を読み込み・実行
// ===============================
async function initDB() {
  try {
    const initSql = fs.readFileSync(path.join(__dirname, "init.sql"), "utf-8");
    await pool.query(initSql);
    console.log("✅ Database initialized (init.sql executed)");
  } catch (err) {
    console.error("❌ Failed to initialize DB:", err);
  }
}

initDB();
