// backend/index.js （完全統合版 v9）
// schedules + personal_schedules API 完備
// personal_schedules: dates を必ず配列で返却

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

// ===== 基本設定 =====
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ===== CORS =====
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ヘルスチェック
app.get("/healthz", (_req, res) =>
  res.status(200).json({ ok: true, env: NODE_ENV })
);

// 軽いレートリミット
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ===== DB初期化 =====
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
        share_token VARCHAR(64) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ DB初期化エラー:", err);
  }
};
initDB();

// ===== Socket.IO =====
io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);
  socket.on("joinSchedule", (token) => {
    if (typeof token === "string" && token.length > 0) socket.join(token);
  });
  socket.on("disconnect", (reason) => {
    console.log("🔴 A user disconnected:", socket.id, reason);
  });
});

// ===== 認証 =====
app.use("/auth", authRouter);

function authRequired(req, res, next) {
  try {
    const header = req.get("Authorization") || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = bearer || req.cookies?.token; // ✅ Bearer 優先
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/api/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

// ==== 共通: timeType 日本語化 ====
function timeLabel(t, s, e) {
  if (t === "allday") return "終日";
  if (t === "day") return "午前";
  if (t === "night") return "午後";
  if (t === "custom") return `${s}〜${e}`;
  return t;
}

// ===== schedules API =====

// 新規作成
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
      [uuidv4(), title, JSON.stringify(normalizedDates), {}, shareToken]
    );

    res.json({ id: result.rows[0].id, share_token: result.rows[0].share_token });
  } catch (err) {
    console.error("❌ schedules作成失敗:", err);
    res.status(500).json({ error: "作成失敗" });
  }
});

// 一覧取得（共有ページ用）
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
    const dates = Array.isArray(schedule.dates)
      ? schedule.dates
      : JSON.parse(schedule.dates || "[]");

    res.json({
      id: schedule.id,
      title: schedule.title,
      dates: dates.map((d) => ({
        ...d,
        label: timeLabel(d.timeType, d.startTime, d.endTime),
      })),
    });
  } catch (err) {
    console.error("❌ schedules取得失敗:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// ===== personal_schedules API =====

// 新規作成
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

    const id = uuidv4();
    await pool.query(
      `INSERT INTO personal_schedules (id, user_id, title, memo, dates, options)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, req.user.discord_id, title, memo || "", JSON.stringify(normalizedDates), options || {}]
    );

    res.json({ id, title, memo, dates: normalizedDates, options: options || {} });
  } catch (err) {
    console.error("❌ personal_schedules 作成失敗:", err);
    res.status(500).json({ error: "作成失敗" });
  }
});

// 一覧取得
app.get("/api/personal-events", authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM personal_schedules WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.discord_id]
    );

    const rows = result.rows.map((r) => ({
      ...r,
      dates: Array.isArray(r.dates) ? r.dates : JSON.parse(r.dates || "[]"), // ✅ 強制配列化
    }));

    res.json(rows);
  } catch (err) {
    console.error("❌ personal_schedules 取得失敗:", err);
    res.status(500).json({ error: "取得失敗" });
  }
});

// 更新
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
      [title, memo || "", JSON.stringify(normalizedDates), options || {}, id, req.user.discord_id]
    );

    res.json({ id, title, memo, dates: normalizedDates, options: options || {} });
  } catch (err) {
    console.error("❌ personal_schedules 更新失敗:", err);
    res.status(500).json({ error: "更新失敗" });
  }
});

// 削除
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

// ===== Reactビルド配信 =====
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

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API not found" });
});

app.get("*", (_req, res) => {
  if (!hasIndex) {
    return res
      .status(500)
      .send("Frontend build is missing. Please run `cd frontend && npm run build`.");
  }
  res.sendFile(indexHtmlPath);
});

// ===== エラーハンドラ =====
app.use((err, _req, res, _next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===== サーバー起動 =====
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (env: ${NODE_ENV})`);
});

// ===== グレースフルシャットダウン =====
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
