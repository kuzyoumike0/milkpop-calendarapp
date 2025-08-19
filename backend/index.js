const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

// DB 接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@db:5432/mydb",
});

// ミドルウェア
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// 予定追加
app.post("/api/shared", async (req, res) => {
  const { username, date, category, startTime, endTime, linkId } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO schedules (id, username, date, category, startTime, endTime, linkId)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [uuidv4(), username, date, category, startTime, endTime, linkId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("追加失敗:", err);
    res.status(500).json({ error: "追加失敗" });
  }
});

// 予定取得
app.get("/api/shared/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM schedules WHERE linkId=$1 ORDER BY date ASC, startTime ASC`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("取得失敗:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// 予定削除 (本人だけ)
app.delete("/api/shared/:linkId/:id", async (req, res) => {
  const { linkId, id } = req.params;
  const { username } = req.body;
  try {
    const result = await pool.query(
      `DELETE FROM schedules WHERE id=$1 AND linkId=$2 AND username=$3`,
      [id, linkId, username]
    );
    if (result.rowCount === 0) {
      return res.status(403).json({ error: "削除できません（本人以外）" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("削除失敗:", err);
    res.status(500).json({ error: "削除失敗" });
  }
});

// 予定編集 (本人だけ)
app.put("/api/shared/:linkId/:id", async (req, res) => {
  const { linkId, id } = req.params;
  const { username, date, category, startTime, endTime } = req.body;

  try {
    const result = await pool.query(
      `UPDATE schedules
       SET date=$1, category=$2, startTime=$3, endTime=$4
       WHERE id=$5 AND linkId=$6 AND username=$7
       RETURNING *`,
      [date, category, startTime, endTime, id, linkId, username]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "編集できません（本人以外）" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("編集失敗:", err);
    res.status(500).json({ error: "編集失敗" });
  }
});

// 共有リンク発行
app.post("/api/sharelink", async (req, res) => {
  const linkId = uuidv4();
  res.json({ linkId });
});

// React のルート
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// サーバー起動
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
