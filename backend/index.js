const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// メモリ保持データ（DBがない簡易版）
let events = [];
let sharedLinks = {};

// ✅ ルートページ
app.get("/", (req, res) => {
  res.send("✅ Calendar Backend is running");
});

// 共有イベント取得
app.get("/api/share", (req, res) => {
  res.json(events);
});

// 個人スケジュール追加
app.post("/api/personal", (req, res) => {
  const event = { id: uuidv4(), ...req.body };
  events.push(event);
  res.json({ success: true, event });
});

// 共有リンク発行
app.post("/api/share/link", (req, res) => {
  const id = uuidv4();
  sharedLinks[id] = [...events];
  res.json({ id });
});

// 共有リンク先の予定取得
app.get("/api/share/:id", (req, res) => {
  res.json(sharedLinks[req.params.id] || []);
});

// ✅ React フロントエンドを返す設定
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// サーバー起動
const PORT = 8080;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
