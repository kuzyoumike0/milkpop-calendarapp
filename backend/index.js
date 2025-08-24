import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

let schedules = {}; // メモリ保存（本番ではPostgreSQL推奨）

// ================== API ==================

// 新規作成
app.post("/api/schedule", (req, res) => {
  const { id, title, dates, range, timeType, timeRange } = req.body;
  schedules[id] = { id, title, dates, range, timeType, timeRange, responses: [] };
  res.json({ ok: true, id });
});

// 取得
app.get("/api/schedule/:id", (req, res) => {
  res.json(schedules[req.params.id]);
});

// 回答保存
app.post("/api/schedule/:id/response", (req, res) => {
  const { user, responses } = req.body;
  const schedule = schedules[req.params.id];
  if (!schedule) return res.status(404).json({ error: "not found" });

  const existing = schedule.responses.find((r) => r.user === user);
  if (existing) {
    existing.responses = responses;
  } else {
    schedule.responses.push({ user, responses });
  }
  res.json({ ok: true });
});

// ================== フロントエンド配信 ==================

// React ビルド済みファイルのパス
const frontendPath = path.join(__dirname, "../frontend/build");

// 静的ファイルを配信
app.use(express.static(frontendPath));

// React Router 対応（すべて index.html に返す）
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ================== サーバー起動 ==================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
