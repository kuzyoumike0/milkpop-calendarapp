const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL 接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// === API ===
// （ここに /api/schedules などのエンドポイントがある想定）

// === フロントエンド静的ファイル配信 ===
const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
