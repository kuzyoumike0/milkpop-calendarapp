const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// フロントのビルド済みファイルを静的配信
app.use(express.static(path.join(__dirname, "../frontend/build")));

// サンプル API
app.get("/api/shared", (req, res) => {
  res.json([{ id: 1, date: req.query.date, time_slot: "10:00", title: "共有イベント1" }]);
});

app.get("/api/personal/:userId", (req, res) => {
  res.json([{ id: 1, date: req.query.date, time_slot: "12:00", title: "個人イベント1" }]);
});

// SPA対応
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
