// backend/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// フロントのビルド済みファイルを静的配信
app.use(express.static(path.join(__dirname, "public")));

// 仮データとしてメモリ内に保持
let events = [];

// 予定取得 API
// ?date=YYYY-MM-DD でその日の予定を取得
app.get("/api/events", (req, res) => {
  const { date } = req.query;
  const filtered = date ? events.filter(e => e.date === date) : events;
  res.json(filtered);
});

// 予定追加 API
app.post("/api/events", (req, res) => {
  const { date, user, time_slot, title } = req.body;
  if (!date || !user || !time_slot || !title) {
    return res.status(400).json({ error: "全てのフィールドが必要です" });
  }
  const id = events.length ? events[events.length - 1].id + 1 : 1;
  const newEvent = { id, date, user, time_slot, title };
  events.push(newEvent);
  res.json(newEvent);
});

// 予定削除 API
app.delete("/api/events/:id", (req, res) => {
  const id = Number(req.params.id);
  events = events.filter(e => e.id !== id);
  res.json({ success: true });
});

// SPA対応（Reactのルーティング）
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
