// backend/index.js
// ---------------------------------------------
// 安全・自動初期化つきバックエンド完全版
// ---------------------------------------------
const express = require("express");
const path = require("path");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

// -------------------- 基本設定 --------------------
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// -------------------- DB接続 ----------------------
const pool =
  process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      })
    : new Pool({
        host: process.env.DB_HOST || "db", // docker-compose で Postgres を "db" サービスにしている想定
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      });

// -------------------- 初期化(一度だけ) ------------
async function initDB() {
  // share_links … 共有リンク本体（share_id をアプリが参照）
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      id SERIAL PRIMARY KEY,
      share_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      description TEXT
    );
  `);

  // schedules … 各ユーザーの日程（1日ごとに1行）
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      share_id TEXT REFERENCES share_links(share_id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      date DATE NOT NULL
    );
  `);

  // 念のため、既存の share_links に share_id が無い環境を自己修復（古いテーブルからの移行対策）
  const colCheck = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name='share_links' AND column_name='share_id'
  `);
  if (colCheck.rowCount === 0) {
    await pool.query(`ALTER TABLE share_links ADD COLUMN share_id TEXT UNIQUE;`);
  }

  console.log("✅ DB initialized");
}

// -------------------- API ------------------------

// ヘルスチェック
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// 共有リンクの発行
// レスポンス: { success: true, shareUrl: "/share/<uuid>", shareId: "<uuid>" }
app.post("/api/share", async (req, res) => {
  try {
    const shareId = uuidv4();
    const description = req.body?.description || null;

    await pool.query(
      `INSERT INTO share_links (share_id, description)
       VALUES ($1, $2)
       ON CONFLICT (share_id) DO NOTHING`,
      [shareId, description]
    );

    res.json({
      success: true,
      shareUrl: `/share/${shareId}`,
      shareId,
    });
  } catch (e) {
    console.error("Error creating share link:", e);
    res.status(500).json({ success: false, error: "failed to create share link" });
  }
});

// 共有リンクに紐づく予定を取得（昇順ソート）
// レスポンス: [{ username, date }, ...]
app.get("/api/schedules/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;

    // shareId の存在チェック（無い場合は 404）
    const link = await pool.query(
      "SELECT share_id FROM share_links WHERE share_id = $1",
      [shareId]
    );
    if (link.rowCount === 0) {
      return res.status(404).json({ success: false, error: "share link not found" });
    }

    const result = await pool.query(
      `SELECT username, date
       FROM schedules
       WHERE share_id = $1
       ORDER BY date ASC, username ASC`,
      [shareId]
    );
    res.json(result.rows);
  } catch (e) {
    console.error("Error fetching schedules:", e);
    res.status(500).json({ success: false, error: "failed to fetch schedules" });
  }
});

// 予定の登録（1回で複数日にも対応）
// 受信: { shareId, username, dates: ["2025-08-01","2025-08-03", ...] }
app.post("/api/schedule", async (req, res) => {
  try {
    const { shareId, username, dates } = req.body;

    if (!shareId || !username || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ success: false, error: "invalid payload" });
    }

    // shareId の存在保証
    const link = await pool.query(
      "SELECT share_id FROM share_links WHERE share_id = $1",
      [shareId]
    );
    if (link.rowCount === 0) {
      return res.status(404).json({ success: false, error: "share link not found" });
    }

    // バルク挿入（1時間単位ではなく 1日単位で登録）
    // ※1時間刻みが必要な場合は別テーブルを用意してください
    const values = [];
    const params = [];
    let idx = 1;
    for (const d of dates) {
      values.push(`($${idx++}, $${idx++}, $${idx++})`);
      params.push(shareId, username, d);
    }

    await pool.query(
      `INSERT INTO schedules (share_id, username, date)
       VALUES ${values.join(",")}
      `,
      params
    );

    res.json({ success: true });
  } catch (e) {
    console.error("Error inserting schedule:", e);
    res.status(500).json({ success: false, error: "failed to insert schedule" });
  }
});

// -------------------- フロント配信 ----------------
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_req, res) => {
  // React のビルド成果物（Dockerfile で /backend/public に配置）
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------------------- 起動 ------------------------
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error("DB init failed:", e);
    process.exit(1);
  });
