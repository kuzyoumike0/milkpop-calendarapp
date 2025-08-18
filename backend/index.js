const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(bodyParser.json());

let eventsByShareId = {}; // { shareId: [event, ...] }

// 新規イベント登録
app.post("/api/events", (req, res) => {
  const { title, date } = req.body;
  const shareId = uuidv4();

  const event = { id: uuidv4(), title, date };
  eventsByShareId[shareId] = [event];

  // 全員に通知
  io.emit("eventUpdated", { shareId, events: eventsByShareId[shareId] });

  res.json({ shareId });
});

// 特定のリンクのイベント取得
app.get("/api/events/:shareId", (req, res) => {
  const { shareId } = req.params;
  res.json(eventsByShareId[shareId] || []);
});

// サーバー起動
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
