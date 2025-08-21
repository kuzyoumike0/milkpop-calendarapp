// 既存の import と app 宣言の後に追加
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// DB 接続
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "calendar",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

// 🔹 リンク一覧 API
app.get("/api/links", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, title, url, description FROM links ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// フロント配信
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Backend running on port ${process.env.PORT || 3000}`);
});
