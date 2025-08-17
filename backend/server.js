import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Railway PostgreSQL 環境変数で接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// DB初期化
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      username TEXT,
      memo TEXT,
      date DATE NOT NULL,
      time_slot TEXT,
      title TEXT NOT NULL
    );
  `);
})();

// 予定取得
app.get("/api/schedules", async (req, res) => {
  const { date } = req.query;
  const result = await pool.query("SELECT * FROM schedules WHERE date=$1", [date]);
  res.json(result.rows);
});

// 予定追加
app.post("/api/schedules", async (req, res) => {
  const { username, memo, date, time_slot, title } = req.body;
  const result = await pool.query(
    "INSERT INTO schedules (username, memo, date, time_slot, title) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [username, memo, date, time_slot, title]
  );
  res.json(result.rows[0]);
});

// 編集
app.put("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  const { title, memo } = req.body;
  const result = await pool.query(
    "UPDATE schedules SET title=$1, memo=$2 WHERE id=$3 RETURNING *",
    [title, memo, id]
  );
  res.json(result.rows[0]);
});

// 削除
app.delete("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM schedules WHERE id=$1", [id]);
  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
