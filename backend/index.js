const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 簡易DB（本番ではPostgreSQLを使用）
let schedulesDB = {};
let sessions = {}; // セッション管理

// ===== ミドルウェア：CSP =====
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  );
  next();
});

// ===== スケジュール保存 =====
app.post("/api/schedules", (req, res) => {
  const { title, schedules } = req.body;
  const id = uuidv4(); // 毎回新しいIDを発行
  schedulesDB[id] = { id, title, schedules, createdAt: new Date() };
  res.json({ id, url: `/share/${id}` });
});

// ===== スケジュール取得（共有リンク用） =====
app.get("/api/share/:id", (req, res) => {
  const id = req.params.id;
  if (schedulesDB[id]) {
    res.json(schedulesDB[id]);
  } else {
    res.status(404).json({ error: "スケジュールが見つかりません" });
  }
});

// ===== フロントエンド静的ファイル提供 =====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
