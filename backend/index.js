const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 個人カレンダーAPI例
app.get("/api/personal/:userId", (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;
  res.json([
    { id: 1, date, title: "打ち合わせ", time_slot: "10:00" },
    { id: 2, date, title: "プレゼン", time_slot: "14:00" }
  ]);
});

// 共有カレンダーAPI例
app.get("/api/shared", (req, res) => {
  const { date } = req.query;
  res.json([
    { id: 1, date, title: "チーム会議", time_slot: "09:00" },
    { id: 2, date, title: "締切", time_slot: "23:59" }
  ]);
});

// SPA フォールバック
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
