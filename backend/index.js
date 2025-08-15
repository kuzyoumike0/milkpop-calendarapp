// backend/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { nanoid } = require("nanoid"); // ID自動生成

const app = express();
app.use(cors());
app.use(express.json());

// メモリ管理用の簡易データ
let events = [];

// 静的ファイル配信 (React ビルド成果物)
app.use(express.static(path.join(__dirname, "public")));

// 共有カレンダー取得
app.get("/api/shared", (req, res) => {
  const { date } = req.query;
  const filtered = events.filter(e => e.date === date);
  res.json(filtered);
});

// 共有カレンダー追加
app.post("/api/shared", (req, res) => {
  const { username, date, time_slot, title } = req.body;
  const event = { id: nanoid(), username, date, time_slot, title };
  events.push(event);
  res.json(event);
});

// 共有カレンダー削除
app.delete("/api/shared/:id", (req, res) => {
  const { id } = req.params;
  events = events.filter(e => e.id !== id);
  res.sendStatus(200);
});

// SPA対応: React Router 用
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
