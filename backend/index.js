const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// APIルート例
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// === フロントエンドの静的ファイル配信 ===
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

// React Router のために全リクエストを index.html にフォールバック
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
