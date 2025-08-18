const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// メモリ内データベース（デモ用、永続化はDBに切替可）
let sharedEvents = [];
let personalEvents = [];

// 共有予定の取得と追加
app.get("/api/shared", (req, res) => res.json(sharedEvents));
app.post("/api/shared", (req, res) => {
  sharedEvents.push(req.body);
  res.json({ success: true });
});

// 個人予定の取得と追加
app.get("/api/personal", (req, res) => res.json(personalEvents));
app.post("/api/personal", (req, res) => {
  personalEvents.push(req.body);
  res.json({ success: true });
});

// Reactビルド成果物を返す
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
