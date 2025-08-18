const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());

// ✅ React ビルドされたファイルを配信
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

// API ルート (例)
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// ✅ React のルート対応（SPA対策）
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Socket.io
io.on("connection", (socket) => {
  console.log("ユーザー接続:", socket.id);

  socket.on("disconnect", () => {
    console.log("ユーザー切断:", socket.id);
  });
});

// ポート設定
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
