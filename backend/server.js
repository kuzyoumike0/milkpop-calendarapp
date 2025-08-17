import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Railway PostgreSQL 接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// DB初期化
async function initDB() {
  await pool.query(`CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    title TEXT,
    username TEXT,
    memo TEXT,
    date DATE,
    time_slot TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
}
initDB();

// スケジュール登録
app.post("/api/schedules", async (req, res) => {
  const { title, username, memo, date, time_slot } = req.body;
  const result = await pool.query(
    "INSERT INTO schedules (title, username, memo, date, time_slot) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [title, username, memo, date, time_slot]
  );
  res.json(result.rows[0]);
});

// スケジュール取得
app.get("/api/schedules", async (req, res) => {
  const result = await pool.query("SELECT * FROM schedules ORDER BY date ASC");
  res.json(result.rows);
});

// React 配信
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
