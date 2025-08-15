const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 個人カレンダーAPI
app.get("/api/personal/:userId", (req, res) => {
  const { userId } = req.params;
  const { month } = req.query;
  res.json([
    { id: 1, date: `${month}-01`, title: "打ち合わせ", time_slot: "10:00" },
    { id: 2, date: `${month}-05`, title: "プレゼン", time_slot: "14:00" }
  ]);
});

// 共有カレンダーAPI
app.get("/api/shared", (req, res) => {
  const { month } = req.query;
  res.json([
    { id: 1, date: `${month}-02`, title: "チーム会議", time_slot: "09:00" },
    { id: 2, date: `${month}-10`, title: "締切", time_slot: "23:59" }
  ]);
});

// React SPA フォールバック
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
