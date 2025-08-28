import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";
import authRouter from "./auth.js";
import pool from "./db.js"; // ← 共通Pool
import jwt from "jsonwebtoken";

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

// ===== 基本設定 =====
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

// CORS（本番は FRONTEND_URL、未設定ならワイルドカード許容）
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
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
  console.log("🟢 A user connected");
  socket.on("joinSchedule", (token) => socket.join(token));
  socket.on("disconnect", () => console.log("🔴 A user disconnected"));
});

// ===== 認証 =====
app.use("/auth", authRouter);

function authRequired(req, res, next) {
  try {
    const header = req.get("Authorization") || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = req.cookies?.token || bearer;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/api/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

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

// 作成
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, options } = req.body;
    if (!dates) {
      return res.status(400).json({ error: "日程は必須です" });
    }
    const id = uuidv4();
    const shareToken = uuidv4();
    const result = await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id, title || "無題スケジュール", JSON.stringify(dates), JSON.stringify(options || {}), shareToken]
    );
    res.json({ share_token: result.rows[0].share_token });
  } catch (err) {
    console.error("DB保存エラー:", err);
    res.status(500).json({ error: "DB保存エラー" });
  }
});

// 詳細取得（共有ページ用）
app.get("/api/schedules/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const result = await pool.query(
      "SELECT * FROM schedules WHERE share_token = $1",
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("スケジュール取得エラー:", err);
    res.status(500).json({ error: "スケジュール取得エラー" });
  }
});

// 回答一覧取得
app.get("/api/schedules/:token/responses", async (req, res) => {
  try {
    const { token } = req.params;
    const schedule = await pool.query(
      "SELECT id FROM schedules WHERE share_token=$1",
      [token]
    );
    if (schedule.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }
    const result = await pool.query(
      "SELECT username, responses FROM schedule_responses WHERE schedule_id=$1",
      [schedule.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("回答取得エラー:", err);
    res.status(500).json({ error: "回答取得エラー" });
  }
});

// 回答保存
app.post("/api/schedules/:token/responses", async (req, res) => {
  try {
    const { token } = req.params;
    const { username, responses } = req.body;

    const schedule = await pool.query(
      "SELECT id FROM schedules WHERE share_token=$1",
      [token]
    );
    if (schedule.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }

    const scheduleId = schedule.rows[0].id;

    // user_id は username をそのまま使う（ログインしていないのでユニーク用）
    await pool.query(
      `INSERT INTO schedule_responses (schedule_id, user_id, username, responses)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (schedule_id, user_id) 
       DO UPDATE SET username=$3, responses=$4, created_at=CURRENT_TIMESTAMP`,
      [scheduleId, username, username, JSON.stringify(responses)]
    );

    const updated = await pool.query(
      "SELECT username, responses FROM schedule_responses WHERE schedule_id=$1",
      [scheduleId]
    );

    res.json(updated.rows);
  } catch (err) {
    console.error("回答保存エラー:", err);
    res.status(500).json({ error: "回答保存エラー" });
  }
});

// ===== 個人スケジュール API =====

// 一覧取得
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

// 新規作成
app.post("/api/personal-events", authRequired, async (req, res) => {
  try {
    const { title, memo, dates, options } = req.body;
    if (!title || !dates) {
      return res.status(400).json({ error: "タイトルと日程は必須です" });
    }
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO personal_schedules (id, user_id, title, memo, dates, options)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, req.user.discord_id, title, memo || "", JSON.stringify(dates), JSON.stringify(options || {})]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("個人スケジュール保存エラー:", err);
    res.status(500).json({ error: "個人スケジュール保存エラー" });
  }
});

// 更新
app.put("/api/personal-events/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, memo, dates, options } = req.body;
    const result = await pool.query(
      `UPDATE personal_schedules
       SET title=$1, memo=$2, dates=$3, options=$4, created_at=CURRENT_TIMESTAMP
       WHERE id=$5 AND user_id=$6
       RETURNING *`,
      [title, memo || "", JSON.stringify(dates), JSON.stringify(options || {}), id, req.user.discord_id]
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

// 削除
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

// ===== Reactビルド配信 =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, "../frontend/build");
const hasIndex = fs.existsSync(path.join(frontendDist, "index.html"));
if (!hasIndex) {
  console.warn("⚠️ frontend/build/index.html が見つかりません。`cd frontend && npm run build` を実行してください。");
}

app.use(
  express.static(frontendDist, {
    index: "index.html",
    maxAge: "1d",
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

// API未定義ハンドラ
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API not found" });
});

// Reactルーティング（SPA対応）
app.get("*", (_req, res) => {
  if (!hasIndex) {
    return res.status(500).send("Frontend build is missing. Please run `cd frontend && npm run build`.");
  }
  res.sendFile(path.join(frontendDist, "index.html"));
});

// ===== サーバー起動 =====
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
