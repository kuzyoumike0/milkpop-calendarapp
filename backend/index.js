const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// === PostgreSQL 接続設定 ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/mydb",
});

// === React のビルドを返す設定 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// === API ===

// 予定の登録と共有リンク発行
app.post("/api/shared", async (req, res) => {
  const { dates, username, category, startTime, endTime } = req.body;
  const linkid = uuidv4();

  try {
    for (const date of dates) {
      await pool.query(
        `INSERT INTO schedules (linkid, date, username, category, starttime, endtime)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [linkid, date, username, category, startTime, endTime]
      );
    }
    res.json({ link: `/share/${linkid}` });
  } catch (err) {
    console.error("共有リンク作成エラー:", err);
    res.status(500).json({ error: "共有リンク作成に失敗しました" });
  }
});

// 共有ページ用: linkid で予定を取得
app.get("/api/shared/:linkid", async (req, res) => {
  const { linkid } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM schedules WHERE linkid = $1 ORDER BY date ASC",
      [linkid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有ページ取得エラー:", err);
    res.status(500).json({ error: "予定の取得に失敗しました" });
  }
});

// 本人だけ編集できる更新
app.put("/api/shared/:linkid/:id", async (req, res) => {
  const { linkid, id } = req.params;
  const { username, category, starttime, endtime } = req.body;

  try {
    // 投稿者確認
    const check = await pool.query(
      "SELECT * FROM schedules WHERE id = $1 AND linkid = $2",
      [id, linkid]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "対象データが存在しません" });
    }

    if (check.rows[0].username !== username) {
      return res.status(403).json({ error: "本人以外は編集できません" });
    }

    await pool.query(
      "UPDATE schedules SET category=$1, starttime=$2, endtime=$3 WHERE id=$4 AND linkid=$5",
      [category, starttime, endtime, id, linkid]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("更新エラー:", err);
    res.status(500).json({ error: "更新に失敗しました" });
  }
});

// 削除（本人だけ）
app.delete("/api/shared/:linkid/:id", async (req, res) => {
  const { linkid, id } = req.params;
  const { username } = req.body;

  try {
    const check = await pool.query(
      "SELECT * FROM schedules WHERE id = $1 AND linkid = $2",
      [id, linkid]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "対象データが存在しません" });
    }

    if (check.rows[0].username !== username) {
      return res.status(403).json({ error: "本人以外は削除できません" });
    }

    await pool.query("DELETE FROM schedules WHERE id = $1 AND linkid = $2", [
      id,
      linkid,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error("削除エラー:", err);
    res.status(500).json({ error: "削除に失敗しました" });
  }
});

// サーバー起動
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
