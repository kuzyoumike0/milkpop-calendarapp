const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let events = []; // 簡易メモリ管理

// 取得
app.get("/api/shared", (req, res) => {
  const { date } = req.query;
  res.json(events.filter(e => e.date === date));
});

// 追加
app.post("/api/shared", (req, res) => {
  const event = req.body;
  events.push(event);
  res.json(event);
});

// 削除
app.delete("/api/shared/:id", (req, res) => {
  const { id } = req.params;
  events = events.filter(e => e.id != id);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
