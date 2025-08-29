// backend/index.js （完全統合版 v5）
// 個人スケジュールに share_token を追加し、共有リンクで閲覧専用アクセス可能
// ✅ authRequired を Bearer 優先に修正

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
    origin: process.env.FRONTEND_URL || "*",
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

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
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
    // ✅ Bearer 優先
    const token = bearer || req.cookies?.token;
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
function timeLabel(t) {
  if (t === "allday") return "終日";
  if (t === "day") return "午前";
  if (t === "night") return "午後";
  if (t === "custom") return "時間指定";
  return t;
}

// ===== schedules API =====

// 一覧
app.get("/api/schedules", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, share_token, created_at FROM schedules ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("DB読み込みエラー:", err);
    res.status(500).json({ error: "DB読み込みエラー" });
  }
});

// 共有スケジュール作成
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, options } = req.body || {};
    if (!dates) {
      return res.status(400).json({ error: "日程は必須です" });
    }
    const id = uuidv4();
    const shareToken = uuidv4();
    const result = await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [
        id,
        title || "無題スケジュール",
        JSON.stringify(dates),
        JSON.stringify(options || {}),
        shareToken,
      ]
    );
    res.json({ share_token: result.rows[0].share_token });
  } catch (err) {
    console.error("DB保存エラー:", err);
    res.status(500).json({ error: "DB保存エラー" });
  }
});

// 特定スケジュール取得
app.get("/api/schedules/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const result = await pool.query(
      "SELECT * FROM schedules WHERE share_token=$1",
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "共有リンクが無効です" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB取得エラー:", err);
    res.status(500).json({ error: "DB取得エラー" });
  }
});

// 出欠回答 保存/更新
app.post("/api/schedules/:token/responses", async (req, res) => {
  try {
    const { token } = req.params;
    const { user_id, username, responses } = req.body || {};

    if (!user_id || !responses) {
      return res.status(400).json({ error: "ユーザーIDと回答は必須です" });
    }

    const schedule = await pool.query(
      "SELECT id, dates FROM schedules WHERE share_token=$1",
      [token]
    );
    if (schedule.rows.length === 0) {
      return res.status(404).json({ error: "共有リンクが無効です" });
    }
    const scheduleId = schedule.rows[0].id;
    const dates = schedule.rows[0].dates;

    // === フロントと同じキー形式に正規化 ===
    const normalizedResponses = {};
    dates.forEach((d) => {
      const key =
        d.timeType === "custom" && d.startTime && d.endTime
          ? `${d.date} (${d.startTime} ~ ${d.endTime})`
          : `${d.date} (${timeLabel(d.timeType)})`;
      normalizedResponses[key] = responses[key] || "-";
    });

    await pool.query(
      `INSERT INTO schedule_responses (schedule_id, user_id, username, responses)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (schedule_id, user_id)
       DO UPDATE SET username=EXCLUDED.username,
                     responses=EXCLUDED.responses,
                     created_at=CURRENT_TIMESTAMP`,
      [
        scheduleId,
        user_id,
        username || "匿名",
        JSON.stringify(normalizedResponses),
      ]
    );

    io.to(token).emit("updateResponses", {
      user_id,
      username,
      responses: normalizedResponses,
    });

    res.json({ user_id, username, responses: normalizedResponses });
  } catch (err) {
    console.error("回答保存エラー:", err);
    res.status(500).json({ error: "回答保存エラー" });
  }
});

// 出欠回答 一覧取得
app.get("/api/schedules/:token/responses", async (req, res) => {
  try {
    const { token } = req.params;
    const schedule = await pool.query(
      "SELECT id FROM schedules WHERE share_token=$1",
      [token]
    );
    if (schedule.rows.length === 0) {
      return res.status(404).json({ error: "共有リンクが無効です" });
    }
    const scheduleId = schedule.rows[0].id;

    const result = await pool.query(
      "SELECT user_id, username, responses, created_at FROM schedule_responses WHERE schedule_id=$1 ORDER BY created_at DESC",
      [scheduleId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("回答一覧取得エラー:", err);
    res.status(500).json({ error: "回答一覧取得エラー" });
  }
});

// 出欠集計
app.get("/api/schedules/:token/aggregate", async (req, res) => {
  try {
    const { token } = req.params;
    const schedule = await pool.query(
      "SELECT id, dates FROM schedules WHERE share_token=$1",
      [token]
    );
    if (schedule.rows.length === 0) {
      return res.status(404).json({ error: "共有リンクが無効です" });
    }
    const scheduleId = schedule.rows[0].id;
    const dates = schedule.rows[0].dates;

    const responses = await pool.query(
      "SELECT username, responses FROM schedule_responses WHERE schedule_id=$1",
      [scheduleId]
    );

    const aggregate = {};
    dates.forEach((d) => {
      const key =
        d.timeType === "custom" && d.startTime && d.endTime
          ? `${d.date} (${d.startTime} ~ ${d.endTime})`
          : `${d.date} (${timeLabel(d.timeType)})`;
      aggregate[key] = { "◯": 0, "✕": 0, "△": 0 };
    });

    responses.rows.forEach((row) => {
      Object.entries(row.responses).forEach(([key, status]) => {
        if (aggregate[key] && ["◯", "✕", "△"].includes(status)) {
          aggregate[key][status]++;
        }
      });
    });

    res.json(aggregate);
  } catch (err) {
    console.error("集計エラー:", err);
    res.status(500).json({ error: "集計エラー" });
  }
});

// 出欠回答削除
app.delete("/api/schedules/:token/responses/:user_id", async (req, res) => {
  try {
    const { token, user_id } = req.params;
    const schedule = await pool.query(
      "SELECT id FROM schedules WHERE share_token=$1",
      [token]
    );
    if (schedule.rows.length === 0) {
      return res.status(404).json({ error: "共有リンクが無効です" });
    }
    const scheduleId = schedule.rows[0].id;

    const result = await pool.query(
      "DELETE FROM schedule_responses WHERE schedule_id=$1 AND user_id=$2 RETURNING *",
      [scheduleId, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }

    io.to(token).emit("deleteResponse", { user_id });

    res.json({ message: "削除しました", deleted: result.rows[0] });
  } catch (err) {
    console.error("削除エラー:", err);
    res.status(500).json({ error: "削除エラー" });
  }
});

// ===== 個人スケジュール API =====
app.get("/api/personal-events", authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM personal_schedules WHERE user_id=$1 ORDER BY created_at DESC",
      [req.user.discord_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("個人スケジュール取得エラー:", err);
    res.status(500).json({ error: "個人スケジュール取得エラー" });
  }
});

app.post("/api/personal-events", authRequired, async (req, res) => {
  try {
    const { title, memo, dates, options } = req.body || {};
    if (!title || !dates) {
      return res.status(400).json({ error: "タイトルと日程は必須です" });
    }
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO personal_schedules (id, user_id, title, memo, dates, options)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        id,
        req.user.discord_id,
        title,
        memo || "",
        JSON.stringify(dates),
        JSON.stringify(options || {}),
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("個人スケジュール保存エラー:", err);
    res.status(500).json({ error: "個人スケジュール保存エラー" });
  }
});

app.put("/api/personal-events/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, memo, dates, options } = req.body || {};
    const result = await pool.query(
      `UPDATE personal_schedules
       SET title=$1, memo=$2, dates=$3, options=$4, created_at=CURRENT_TIMESTAMP
       WHERE id=$5 AND user_id=$6
       RETURNING *`,
      [
        title,
        memo || "",
        JSON.stringify(dates),
        JSON.stringify(options || {}),
        id,
        req.user.discord_id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "予定が見つかりません" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("更新エラー:", err);
    res.status(500).json({ error: "更新エラー" });
  }
});

app.delete("/api/personal-events/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM personal_schedules WHERE id=$1 AND user_id=$2 RETURNING *",
      [id, req.user.discord_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "予定が見つかりません" });
    }
    res.json({ message: "削除しました", deleted: result.rows[0] });
  } catch (err) {
    console.error("削除エラー:", err);
    res.status(500).json({ error: "削除エラー" });
  }
});

// ==== 個人スケジュール共有リンク発行 ====
app.post("/api/personal-events/:id/share", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const token = uuidv4();
    const result = await pool.query(
      `UPDATE personal_schedules
       SET share_token=$1
       WHERE id=$2 AND user_id=$3
       RETURNING share_token`,
      [token, id, req.user.discord_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "対象が見つかりません" });
    }
    res.json({ share_token: result.rows[0].share_token });
  } catch (err) {
    console.error("共有リンク発行エラー:", err);
    res.status(500).json({ error: "共有リンク発行エラー" });
  }
});

// ==== 個人スケジュール共有ページ閲覧 ====
app.get("/api/personal-share/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const result = await pool.query(
      "SELECT title, memo, dates, created_at FROM personal_schedules WHERE share_token=$1",
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "共有リンクが無効です" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("個人共有取得エラー:", err);
    res.status(500).json({ error: "個人共有取得エラー" });
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
