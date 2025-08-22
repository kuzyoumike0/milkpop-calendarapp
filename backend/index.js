const express = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const sharedData = {}; // 共有用データをメモリ保存

// スケジュール保存
app.post("/api/schedules", (req, res) => {
  console.log("POST /api/schedules", req.body);
  res.json({ ok: true, data: req.body });
});

// スケジュール更新
app.put("/api/schedules/:id", (req, res) => {
  console.log("PUT /api/schedules/:id", req.params.id, req.body);
  res.json({ ok: true, id: req.params.id, data: req.body });
});

// 共有リンク作成
app.post("/api/share", (req, res) => {
  const { schedules } = req.body;
  const id = randomBytes(4).toString("hex");
  sharedData[id] = { schedules };
  res.json({ id });
});

// 共有リンク参照
app.get("/api/share/:id", (req, res) => {
  const id = req.params.id;
  if (!sharedData[id]) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(sharedData[id]);
});

// サーバー起動
app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
