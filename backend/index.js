const express = require("express");
const path = require("path");

const app = express();  // ← これを必ず定義

// 静的ファイル配信
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

// React Router のための catch-all
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// サーバー起動
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
