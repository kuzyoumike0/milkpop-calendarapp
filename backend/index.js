// backend/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { createServer } from "http";
import { Server } from "socket.io";
import authRouter from "./auth.js";
import pool from "./db.js"; // ← 共通Pool
import jwt from "jsonwebtoken";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 5000;

// ===== ミドルウェア =====
app.use(express.json());
app.use(cookieParser());

if (process.env.FRONTEND_URL) {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );
}

app.set("trust proxy", 1);

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
        share_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
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

// ===== 認証・ユーザー関連 =====
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
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/api/me", authRequired, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, discord_id, username, now() AS server_time FROM public.users WHERE id = $1",
    [req.user.userId]
  );
  if (!rows[0]) return res.status(404).json({ error: "User not found" });
  res.json({ user: rows[0] });
});

// ===== schedules API =====
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

// --- 共有スケジュール作成 ---
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, dates, options } = req.body;
    if (!title || !dates) {
      return res.status(400).json({ error: "タイトルと日程は必須です" });
    }

    const id = uuidv4();
    const shareToken = uuidv4();

    const result = await pool.query(
      `INSERT INTO schedules (id, title, dates, options, share_token)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, title, JSON.stringify(dates), JSON.stringify(options || {}), shareToken]
    );

    res.json({ share_token: result.rows[0].share_token });
  } catch (err) {
    console.error("DB保存エラー:", err);
    res.status(500).json({ error: "DB保存エラー" });
  }
});

// --- 特定スケジュール取得 ---
app.get("/api/schedules/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const result = await pool.query("SELECT * FROM schedules WHERE share_token=$1", [token]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "共有リンクが無効です" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB取得エラー:", err);
    res.status(500).json({ error: "DB取得エラー" });
  }
});

// --- 出欠回答 保存/更新 ---
app.post("/api/schedules/:token/responses", async (req, res) => {
  try {
    const { token } = req.params;
    const { user_id, username, responses } = req.body;

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

    // 🔑 responses を「日付 (時間帯)」キーで揃える
    const normalizedResponses = {};
    dates.forEach((d) => {
      const key =
        d.timeType === "時間指定" && d.startTime && d.endTime
          ? `${d.date} (${d.startTime} ~ ${d.endTime})`
          : `${d.date} (${d.timeType})`;

      normalizedResponses[key] = responses[key] || "-";
    });

    const result = await pool.query(
      `INSERT INTO schedule_responses (schedule_id, user_id, username, responses)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (schedule_id, user_id)
       DO UPDATE SET username = EXCLUDED.username,
                     responses = EXCLUDED.responses,
                     created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [scheduleId, user_id, username || "匿名", JSON.stringify(normalizedResponses)]
    );

    // 🔥 リアルタイム通知
    io.to(token).emit("updateResponses", {
      user_id,
      username,
      responses: normalizedResponses,
    });

    res.json({
      user_id,
      username,
      responses: normalizedResponses,
    });
  } catch (err) {
    console.error("回答保存エラー:", err);
    res.status(500).json({ error: "回答保存エラー" });
  }
});

// --- 出欠回答 一覧取得 ---
app.get("/api/schedules/:token/responses", async (req, res) => {
  try {
    const { token } = req.params;
    const schedule = await pool.query("SELECT id FROM schedules WHERE share_token=$1", [token]);
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

// --- 出欠集計 ---
app.get("/api/schedules/:token/aggregate", async (req, res) => {
  try {
    const { token } = req.params;
    const schedule = await pool.query("SELECT id, dates FROM schedules WHERE share_token=$1", [token]);
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
        d.timeType === "時間指定" && d.startTime && d.endTime
          ? `${d.date} (${d.startTime} ~ ${d.endTime})`
          : `${d.date} (${d.timeType})`;
      aggregate[key] = { "○": 0, "✖": 0, "△": 0 };
    });

    responses.rows.forEach((row) => {
      Object.entries(row.responses).forEach(([key, status]) => {
        if (aggregate[key] && ["○", "✖", "△"].includes(status)) {
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

// --- 特定ユーザー回答の削除 ---
app.delete("/api/schedules/:token/responses/:user_id", async (req, res) => {
  try {
    const { token, user_id } = req.params;
    const schedule = await pool.query("SELECT id FROM schedules WHERE share_token=$1", [token]);
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

// --- 個人スケジュール保存 ---
app.post("/api/personal", async (req, res) => {
  try {
    const { share_id, title, memo, dates, options } = req.body;
    if (!share_id || !title || !dates) {
      return res.status(400).json({ error: "必須項目が不足しています" });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO personal_schedules (id, share_id, title, memo, dates, options)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, share_id, title, memo || "", JSON.stringify(dates), JSON.stringify(options || {})]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("個人スケジュール保存エラー:", err);
    res.status(500).json({ error: "個人スケジュール保存エラー" });
  }
});

// ===== Reactビルド配信 =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ===== サーバー起動 =====
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
