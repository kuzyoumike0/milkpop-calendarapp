const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// ミドルウェア
app.use(cors());
app.use(express.json());

// -----------------------------
// APIルート例
// -----------------------------
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend API!" });
});

// -----------------------------
// React のビルド成果物を配信
// -----------------------------
const frontendPath = path.join(__dirname, "frontend/build");
app.use(express.static(frontendPath));

// React Router 対応: どのルートでも index.html を返す
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// -----------------------------
// サーバー起動
// -----------------------------
app.listen(PORT, () => {
  console.log(`✅ Calendar backend running on port ${PORT}`);
});
