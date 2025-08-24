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
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
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
    if (!title || !dates) {
      return res.status(400).json({ error: "タイトルと日程は必須です" });
    }
    const result = await pool.query(
      `INSERT INTO schedules (title, dates, memo, timerange) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, JSON.stringify(dates), memo || "", timerange || ""]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB保存エラー:", err);
    res.status(500).json({ error: "DB保存エラー" });
  }
});

// 日程を更新
app.put("/api/schedules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, dates, memo, timerange } = req.body;
    const result = await pool.query(
      `UPDATE schedules 
       SET title=$1, dates=$2, memo=$3, timerange=$4 
       WHERE id=$5 RETURNING *`,
      [title, JSON.stringify(dates), memo || "", timerange || "", id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB更新エラー:", err);
    res.status(500).json({ error: "DB更新エラー" });
  }
});

// 日程を削除
app.delete("/api/schedules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM schedules WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }
    res.json({ message: "削除しました", deleted: result.rows[0] });
  } catch (err) {
    console.error("DB削除エラー:", err);
    res.status(500).json({ error: "DB削除エラー" });
  }
});

// ===== Reactビルドを配信 =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildPath = path.join(__dirname, "public");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// ===== サーバー起動 =====
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
