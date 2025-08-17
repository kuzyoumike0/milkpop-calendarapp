import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB接続設定 (Railway の DATABASE_URL 環境変数)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// テーブル初期化
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      username TEXT,
      time_slot TEXT,
      memo TEXT,
      type TEXT DEFAULT 'personal'
    );
  `);
})();

// 個人予定取得
app.get("/api/personal", async (req, res) => {
  const result = await pool.query("SELECT * FROM schedules WHERE type='personal' ORDER BY date");
  res.json(result.rows);
});

// 共有予定取得
app.get("/api/shared", async (req, res) => {
  const { date } = req.query;
  const result = await pool.query("SELECT * FROM schedules WHERE type='shared' AND date=$1", [date]);
  res.json(result.rows);
});

// 予定追加
app.post("/api/add", async (req, res) => {
  const { date, username, time_slot, memo, type } = req.body;
  await pool.query(
    "INSERT INTO schedules (date, username, time_slot, memo, type) VALUES ($1,$2,$3,$4,$5)",
    [date, username, time_slot, memo, type || "personal"]
  );
  res.json({ status: "ok" });
});

// 予定編集
app.put("/api/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { username, time_slot, memo } = req.body;
  await pool.query(
    "UPDATE schedules SET username=$1, time_slot=$2, memo=$3 WHERE id=$4",
    [username, time_slot, memo, id]
  );
  res.json({ status: "ok" });
});

// 予定削除
app.delete("/api/delete/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM schedules WHERE id=$1", [id]);
  res.json({ status: "deleted" });
});

// React build配信
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("🚀 Server running on port", port));
