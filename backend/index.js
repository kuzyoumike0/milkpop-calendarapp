const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// フロントの build を配信
app.use(express.static(path.join(__dirname, "../frontend/build")));

// React Router 対応: どのルートでも index.html を返す
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// API ルート (例)
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
