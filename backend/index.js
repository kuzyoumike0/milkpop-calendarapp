const express = require("express");
const path = require("path");

const app = express();

// APIルート（例）
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Reactビルドファイルを静的配信
app.use(express.static(path.join(__dirname, "public")));

// ReactのSPAルーティング対応
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ サーバーがポート ${PORT} で起動しました`);
});
