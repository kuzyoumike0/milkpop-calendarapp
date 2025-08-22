const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());

// 静的ファイル配信
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// APIサンプル
app.post("/api/schedules", (req, res) => {
  console.log("📥 受信:", req.body);
  res.json({ ok: true, id: uuidv4(), data: req.body });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
