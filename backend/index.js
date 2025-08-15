const express = require("express");
const cors = require("cors");
const path = require("path");
const { nanoid } = require("nanoid");

const app = express();
app.use(cors());
app.use(express.json());

let events = []; // 簡易メモリ管理

// API: 取得
app.get("/api/shared", (req, res) => {
  const { date } = req.query;
  res.json(events.filter(e => e.date === date));
});

// API: 追加
app.post("/api/shared", (req, res) => {
  const event = { ...req.body, id: nanoid() };
  events.push(event);
  res.json(event);
});

// API: 削除
app.delete("/api/shared/:id", (req, res) => {
  const { id } = req.params;
  events = events.filter(e => e.id !== id);
  res.sendStatus(200);
});

// 静的ファイル配信
app.use(express.static(path.join(__dirname, "public")));

// SPA対応（フロントのルーティング対策）
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
