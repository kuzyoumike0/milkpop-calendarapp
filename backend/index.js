// backend/index.js
// ===== 完全統合版 v22 =====
// - 追加: GET/POST /api/schedules/:shareToken/responses（回答のDB保存＆取得、UPSERT）
// - 追加: socket.on("updateResponses") 中継 → 部屋(shareToken)へブロードキャスト
// - 追加: POST /api/shorten, GET /s/:code（PostgreSQLによる短縮URL機能）
// - 既存の v20 の仕様はすべて維持

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid"; // ★ 追加：短縮コード生成

import authRouter from "./auth.js";
import pool from "./db.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL_ENV = process.env.FRONTEND_URL || "http://localhost:3000";

function resolveBaseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host  = req.headers["x-forwarded-host"] || req.get("host");
  if (host) return `${proto}://${host}`;
  if (FRONTEND_URL_ENV && /^https?:\/\//i.test(FRONTEND_URL_ENV)) {
    return FRONTEND_URL_ENV.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

app.set("trust proxy", 1);

// ===== Helmet（CSP）=====
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://pagead2.googlesyndication.com",
          "https://www.googletagservices.com",
          "https://securepubads.g.doubleclick.net",
          "https://ep1.adtrafficquality.google",
          "https://ep2.adtrafficquality.google",
        ],
        scriptSrcElem: [
          "'self'",
          "https://pagead2.googlesyndication.com",
          "https://www.googletagservices.com",
          "https://securepubads.g.doubleclick.net",
          "https://ep1.adtrafficquality.google",
          "https://ep2.adtrafficquality.google",
        ],
        frameSrc: [
          "'self'",
          "https://googleads.g.doubleclick.net",
          "https://tpc.googlesyndication.com",
          "https://adservice.google.com",
          "https://adservice.google.co.jp",
          "https://*.googlesyndication.com",
          "https://*.google.com",
          "https://ep1.adtrafficquality.google",
          "https://ep2.adtrafficquality.google",
        ],
        childSrc: [
          "'self'",
          "https://googleads.g.doubleclick.net",
          "https://tpc.googlesyndication.com",
          "https://adservice.google.com",
          "https://adservice.google.co.jp",
          "https://*.googlesyndication.com",
          "https://*.google.com",
          "https://ep1.adtrafficquality.google",
          "https://ep2.adtrafficquality.google",
        ],
        connectSrc: [
          "'self'",
          FRONTEND_URL_ENV,
          process.env.BACKEND_URL || "",
          "https://*.googlesyndication.com",
          "https://googleads.g.doubleclick.net",
          "https://adservice.google.com",
          "https://adservice.google.co.jp",
          "https://ep1.adtrafficquality.google",
          "https://ep2.adtrafficquality.google",
        ].filter(Boolean),
        imgSrc: [
          "'self'",
          "data:",
          "https://*.googleusercontent.com",
          "https://*.googlesyndication.com",
          "https://googleads.g.doubleclick.net",
          "https://*.googletagservices.com",
          "https://*.adtrafficquality.google",
          "https://ep1.adtrafficquality.google",
          "https://ep2.adtrafficquality.google",
        ],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: FRONTEND_URL_ENV,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.get("/healthz", (_req, res) =>
  res.status(200).json({ ok: true, env: NODE_ENV })
);

app.get("/ads.txt", (_req, res) => {
  res
    .type("text/plain")
    .send("google.com, ca-pub-1851621870746917, DIRECT, f08c47fec0942fa0\n");
});

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ===== DB 初期化 =====
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        dates JSONB NOT NULL,
        options JSONB,
        share_token VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedule_responses (
        id SERIAL PRIMARY KEY,
        schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL,
        username TEXT,
        responses JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(schedule_id, user_id)
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS personal_schedules (
        id UUID PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        title TEXT NOT NULL,
        memo TEXT,
        dates JSONB NOT NULL,
        options JSONB,
        share_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // ★ 追加：短縮URLテーブル（PostgreSQL）
    await pool.query(`
      CREATE TABLE IF NOT EXISTS short_urls (
        code VARCHAR(32) PRIMARY KEY,
        url  TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_short_urls_url ON short_urls(url);`);

    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ DB初期化エラー:", err);
  }
};
initDB();

// ===== Socket.io =====
io.on("connection", (socket) => {
  console.log("🟢 connected:", socket.id);

  socket.on("joinSchedule", (token) => {
    if (typeof token === "string" && token.length > 0) socket.join(token);
  });

  // ← 追加: クライアントからのトリガを部屋にブロードキャスト
  socket.on("updateResponses", (token) => {
    if (typeof token === "string" && token.length > 0) {
      io.to(token).emit("updateResponses");
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 disconnected:", socket.id, reason);
  });
});

// ===== 認証 =====
app.use("/auth", authRouter);

function authRequired(req, res, next) {
  try {
    const header = req.get("Authorization") || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = bearer || req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    console.error("❌ authRequired failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/api/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

function timeLabel(t, s, e) {
  if (t === "allday") return "終日";
  if (t === "morning") return "午前";
  if (t === "afternoon") return "午後";
  if (t === "custom") return `${s ?? ""}〜${e ?? ""}`;
  return t;
}

// ======================
// 共有リンク: 既存（互換維持）
// ======================
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates } = req.body;
    if (!title || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: "タイトルと日程が必須です" });
    }

    const normalizedDates = dates.map((d) => ({
      date: d.date,
      timeType: d.timeType || "allday",
      startTime: d.startTime || "09:00",
      endTime: d.endTime || "18:00",
    }));

    const shareToken = uuidv4();
    const result = await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, share_token`,
      [uuidv4(), title, JSON.stringify(normalizedDates), JSON.stringify({}), shareToken]
    );
    
    const baseUrl = resolveBaseUrl(req);
    const shareUrl = `${baseUrl}/share/${result.rows[0].share_token}`;
    res.json({
      id: result.rows[0].id,
      share_token: result.rows[0].share_token,
      share_url: shareUrl,
    });
  } catch (err) {
    console.error("❌ schedules作成失敗:", err);
    res.status(500).json({ error: "作成失敗" });
  }
});

// ======================
// 共有リンク: 新規（★日程0件でも作成OK / 要ログイン）
// ======================
app.post("/api/schedules/create", authRequired, async (req, res) => {
  try {
    const { title, dates } = req.body || {};
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title required" });
    }
    const normalizedDates = Array.isArray(dates)
      ? dates.map((d) =>
          typeof d === "string"
            ? d
            : d?.date ?? null
        ).filter(Boolean)
      : [];

    const shareToken = uuidv4().replace(/-/g, "").slice(0, 24);
    const scheduleId = uuidv4();

    await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        scheduleId,
        title.trim() || "未設定スケジュール",
        JSON.stringify(normalizedDates),
        JSON.stringify({ owner: req.user.discord_id }),
        shareToken,
      ]
    );

    const baseUrl = resolveBaseUrl(req);
    const shareUrl = `${baseUrl}/share/${shareToken}`;
    res.json({ id: scheduleId, share_token: shareToken, share_url: shareUrl,});
  } catch (err) {
    console.error("❌ schedules/create 失敗:", err);
    res.status(500).json({ error: "作成失敗" });
  }
});

// 自分の共有一覧（owner フィルタ）
app.get("/api/schedules/mine", authRequired, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, title, share_token, created_at
       FROM schedules
       WHERE (options->>'owner') = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [String(req.user.discord_id || "")]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("❌ schedules/mine 取得失敗:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// 単一共有取得
app.get("/api/schedules/:shareToken", async (req, res) => {
  try {
    const { shareToken } = req.params;
    const result = await pool.query(
      `SELECT * FROM schedules WHERE share_token = $1 LIMIT 1`,
      [shareToken]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }
    const schedule = result.rows[0];
    const raw = Array.isArray(schedule.dates) ? schedule.dates : [];
    const isObjectDates = raw.length > 0 && typeof raw[0] === "object" && raw[0] !== null;
    const dates = isObjectDates
      ? raw.map((d) => ({ ...d, label: timeLabel(d.timeType, d.startTime, d.endTime) }))
      : raw;
    res.json({ id: schedule.id, title: schedule.title, dates });
  } catch (err) {
    console.error("❌ schedules取得失敗:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// ======================
// ★ 追加: 回答の取得/保存（DB, UPSERT）
// ======================

// 共有トークン → schedule_id を取得
async function getScheduleIdByShareToken(shareToken) {
  const r = await pool.query(
    `SELECT id FROM schedules WHERE share_token = $1 LIMIT 1`,
    [shareToken]
  );
  return r.rows[0]?.id || null;
}

// 回答一覧の取得
app.get("/api/schedules/:shareToken/responses", async (req, res) => {
  try {
    const { shareToken } = req.params;
    const scheduleId = await getScheduleIdByShareToken(shareToken);
    if (!scheduleId) return res.status(404).json({ error: "スケジュールが見つかりません" });

    const r = await pool.query(
      `SELECT user_id, username, responses, created_at
       FROM schedule_responses
       WHERE schedule_id = $1
       ORDER BY created_at ASC`,
      [scheduleId]
    );

    // DBのJSONBをそのまま返す（フロントでnormalizeResponses済み）
    res.json(
      r.rows.map((row) => ({
        user_id: row.user_id,
        username: row.username,
        responses: row.responses,
        created_at: row.created_at,
      }))
    );
  } catch (err) {
    console.error("❌ responses取得失敗:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// 回答の保存（UPSERT: schedule_id + user_id）
app.post("/api/schedules/:shareToken/responses", async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { user_id, username, responses } = req.body || {};

    if (!user_id || typeof user_id !== "string") {
      return res.status(400).json({ error: "user_id is required" });
    }
    if (!responses || typeof responses !== "object") {
      return res.status(400).json({ error: "responses must be an object" });
    }

    const scheduleId = await getScheduleIdByShareToken(shareToken);
    if (!scheduleId) return res.status(404).json({ error: "スケジュールが見つかりません" });

    await pool.query(
      `INSERT INTO schedule_responses (schedule_id, user_id, username, responses)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (schedule_id, user_id)
       DO UPDATE SET username = EXCLUDED.username,
                     responses = EXCLUDED.responses,
                     created_at = NOW()`,
      [scheduleId, user_id, username || "", JSON.stringify(responses)]
    );

    // 同じトークン部屋にブロードキャスト（即時反映）
    io.to(shareToken).emit("updateResponses");

    res.json({ ok: true });
  } catch (err) {
    console.error("❌ responses保存失敗:", err);
    res.status(500).json({ error: "保存失敗" });
  }
});

// ======================
// 個人日程: 既存（互換維持）
// ======================
app.post("/api/personal-events", authRequired, async (req, res) => {
  try {
    const { title, memo, dates, options } = req.body;
    if (!title || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: "タイトルと日程が必須です" });
    }
    const normalizedDates = dates.map((d) => ({
      date: d.date,
      timeType: d.timeType || "allday",
      startTime: d.startTime || "09:00",
      endTime: d.endTime || "18:00",
    }));

    const personalId = uuidv4();
    const shareId = uuidv4();
    const shareToken = uuidv4();

    await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token)
       VALUES ($1,$2,$3,$4,$5)`,
      [shareId, title, JSON.stringify(normalizedDates), JSON.stringify(options || {}), shareToken]
    );

    await pool.query(
      `INSERT INTO personal_schedules (id,user_id,title,memo,dates,options,share_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        personalId,
        req.user.discord_id,
        title,
        memo || "",
        JSON.stringify(normalizedDates),
        JSON.stringify(options || {}),
        shareId,
      ]
    );

    const baseUrl = resolveBaseUrl(req);
    res.json({
      id: personalId,
      title,
      memo: memo || "",
      dates: normalizedDates,
      options: options || {},
      share_url: `${baseUrl}/share/${shareToken}`,
    });
  } catch (err) {
    console.error("❌ personal_schedules 作成失敗:", err);
    res.status(500).json({ error: "作成失敗" });
  }
});

app.get("/api/personal-events", authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ps.*, s.share_token
       FROM personal_schedules ps
       LEFT JOIN schedules s ON ps.share_id = s.id
       WHERE ps.user_id=$1
       ORDER BY ps.created_at DESC`,
      [req.user.discord_id]
    );

    const baseUrl = resolveBaseUrl(req);

    const rows = result.rows.map((r) => ({
      ...r,
      dates: Array.isArray(r.dates) ? r.dates : JSON.parse(r.dates || "[]"),
      share_url: r.share_token ? `${baseUrl}/share/${r.share_token}` : null,
    }));
    res.json(rows);
  } catch (err) {
    console.error("❌ personal_schedules 取得失敗:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

app.put("/api/personal-events/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, memo, dates, options } = req.body;
    const normalizedDates = (dates || []).map((d) => ({
      date: d.date,
      timeType: d.timeType || "allday",
      startTime: d.startTime || "09:00",
      endTime: d.endTime || "18:00",
    }));
    await pool.query(
      `UPDATE personal_schedules
       SET title=$1, memo=$2, dates=$3, options=$4
       WHERE id=$5 AND user_id=$6`,
      [
        title,
        memo || "",
        JSON.stringify(normalizedDates),
        JSON.stringify(options || {}),
        id,
        req.user.discord_id,
      ]
    );
    res.json({ id, title, memo: memo || "", dates: normalizedDates, options: options || {} });
  } catch (err) {
    console.error("❌ personal_schedules 更新失敗:", err);
    res.status(500).json({ error: "更新失敗" });
  }
});

app.delete("/api/personal-events/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `DELETE FROM personal_schedules WHERE id=$1 AND user_id=$2`,
      [id, req.user.discord_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ personal_schedules 削除失敗:", err);
    res.status(500).json({ error: "削除失敗" });
  }
});

// ======================
// ★ 短縮URL API（PostgreSQL）
// ======================

// POST /api/shorten { url } -> { code, shortUrl }
app.post("/api/shorten", async (req, res) => {
  try {
    const { url } = req.body || {};
    if (typeof url !== "string" || url.length < 5) {
      return res.status(400).json({ error: "Invalid url" });
    }
    // http/https のみ許可
    try {
      const u = new URL(url);
      if (!/^https?:$/.test(u.protocol)) {
        return res.status(400).json({ error: "Only http/https is allowed" });
      }
    } catch {
      return res.status(400).json({ error: "URL parse failed" });
    }

    // 既存チェック
    const found = await pool.query(
      `SELECT code FROM short_urls WHERE url = $1 LIMIT 1`,
      [url]
    );

    let code = found.rows[0]?.code;
    if (!code) {
      // ユニークコード生成（最大5回トライ）
      for (let i = 0; i < 5; i++) {
        const c = nanoid(7);
        try {
          await pool.query(
            `INSERT INTO short_urls(code, url) VALUES($1, $2)`,
            [c, url]
          );
          code = c;
          break;
        } catch (e) {
          // 重複時はリトライ
          if (i === 4) throw e;
        }
      }
    }

    const origin = resolveBaseUrl(req).replace(/\/+$/, "");
    const shortUrl = `${origin}/s/${code}`;
    return res.json({ code, shortUrl });
  } catch (e) {
    console.error("❌ shorten error:", e);
    return res.status(500).json({ error: "internal error" });
  }
});

// GET /s/:code -> 302 redirect
app.get("/s/:code", async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) return res.status(400).send("Bad Request");
    const r = await pool.query(
      `SELECT url FROM short_urls WHERE code = $1 LIMIT 1`,
      [code]
    );
    const target = r.rows[0]?.url;
    if (!target) return res.status(404).send("Not Found");
    return res.redirect(302, target);
  } catch (e) {
    console.error("❌ redirect error:", e);
    return res.status(500).send("Internal Server Error");
  }
});

// ===== 静的配信（SPA）=====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, "../frontend/build");
const indexHtmlPath = path.join(frontendDist, "index.html");
const hasIndex = fs.existsSync(indexHtmlPath);

if (!hasIndex) {
  console.warn("⚠️ frontend/build/index.html が見つかりません。");
}

app.use(
  express.static(frontendDist, {
    index: "index.html",
    maxAge: NODE_ENV === "production" ? "1d" : 0,
  })
);

// 未定義API（※ /api/shorten より後に置く）
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API not found" });
});

// SPA fallback
app.get("*", (_req, res) => {
  if (!hasIndex) {
    return res
      .status(500)
      .send("Frontend build is missing. Please run `cd frontend && npm run build`.");
  }
  res.sendFile(indexHtmlPath);
});

// エラーハンドラ
app.use((err, _req, res, _next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===== 起動・終了処理 =====
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (env: ${NODE_ENV})`);
});

const shutdown = (signal) => {
  console.log(`\n${signal} received. Closing server...`);
  server.close(() => {
    console.log("HTTP server closed.");
    try {
      pool.end?.();
    } catch {}
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 8000).unref();
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
