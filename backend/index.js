import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// ===== DB接続設定 =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway の環境変数
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(bodyParser.json());

// ===== API =====

// 全日程を取得
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("DB読み込みエラー:", err);
    res.status(500).json({ error: "DB読み込みエラー" });
  }
});

// 日程を保存
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, memo, timerange } = req.body;
    const result = await pool.query(
      "INSERT INTO schedules (title, dates, memo, timerange) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, JSON.stringify(dates), memo || "", timerange || ""]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB保存エラー:", err);
    res.status(500).json({ error: "DB保存エラー" });
  }
});

// ===== Reactビルドを配信 =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ===== サーバー起動 =====
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
