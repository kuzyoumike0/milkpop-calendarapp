// backend/index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const helmet = require("helmet");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 8080;

// === ミドルウェア ===
app.use(cors());
app.use(bodyParser.json());

// === CSP (Google Fonts対応) ===
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  })
);

// === PostgreSQL 接続 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === init.sql を自動実行（最初の1回だけ） ===
async function initDB() {
  try {
    // schedules テーブルが存在するか確認
    const result = await pool.query(
      "SELECT to_regclass('public.schedules') as exists"
    );
    if (!result.rows[0].exists) {
      console.log("📦 schedules テーブルが存在しません → init.sql を流します");

      const initSql = fs.readFileSync(path.join(__dirname, "init.sql"), "utf8");
      await pool.query(initSql);

      console.log("✅ init.sql の実行が完了しました");
    } else {
      console.log("✅ schedules テーブルは既に存在します");
    }
  } catch (err) {
    console.error("❌ init.sql 実行エラー:", err);
  }
}

// === スケジュール保存 & 共有リンク発行 ===
app.post("/api/shared", async (req, res) => {
  const { username, mode, dates } = req.body;

  if (!username || !dates || dates.length === 0) {
    return res.status(400).json({ error: "必要な情報が不足しています" });
  }

  try {
    const linkId = uuidv4();

    for (const d of dates) {
      await pool.query(
        "INSERT INTO schedules (link_id, username, schedule_date, mode) VALUES ($1, $2, $3, $4)",
        [linkId, username, d, mode]
      );
    }

    res.json({ message: "保存完了", linkId });
  } catch (err) {
    console.error("DB保存エラー:", err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});

// === 共有リンクから予定取得 ===
app.get("/api/shared/:linkId", async (req, res) => {
  const { linkId } = req.params;

  try {
    const result = await pool.query(
      "SELECT username, schedule_date, mode FROM schedules WHERE link_id = $1 ORDER BY username ASC, schedule_date ASC",
      [linkId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "リンクが見つかりません" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("DB取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});

// === 共有リンクに予定を追記 ===
app.post("/api/shared/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { username, mode, dates } = req.body;

  if (!username || !dates || dates.length === 0) {
    return res.status(400).json({ error: "必要な情報が不足しています" });
  }

  try {
    for (const d of dates) {
      await pool.query(
        "INSERT INTO schedules (link_id, username, schedule_date, mode) VALUES ($1, $2, $3, $4)",
        [linkId, username, d, mode]
      );
    }

    res.json({ message: "追記完了" });
  } catch (err) {
    console.error("DB追記エラー:", err);
    res.status(500).json({ error: "追記に失敗しました" });
  }
});

// === 共有リンクから予定を削除 ===
app.delete("/api/shared/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { username, date } = req.body;

  if (!username || !date) {
    return res.status(400).json({ error: "必要な情報が不足しています" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM schedules WHERE link_id = $1 AND username = $2 AND schedule_date = $3 RETURNING *",
      [linkId, username, date]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "対象データが見つかりません" });
    }

    res.json({ message: "削除完了" });
  } catch (err) {
    console.error("DB削除エラー:", err);
    res.status(500).json({ error: "削除に失敗しました" });
  }
});

// === React ビルドファイル配信 ===
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// === サーバー起動（init.sql 実行後） ===
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
});
