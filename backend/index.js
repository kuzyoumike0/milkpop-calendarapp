import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let schedules = {}; // メモリ保存（本番はPostgreSQL推奨）

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

  // 上書き or 新規
  const existing = schedule.responses.find((r) => r.user === user);
  if (existing) {
    existing.responses = responses;
  } else {
    schedule.responses.push({ user, responses });
  }
  res.json({ ok: true });
});

app.listen(3001, () => console.log("API running on :3001"));
