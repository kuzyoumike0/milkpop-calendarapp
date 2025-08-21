const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === ルート確認用 ===
app.get("/", (req, res) => {
  res.send("🚀 MilkPOP Calendar Backend is running!");
});

// === サーバー起動 ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  const railwayUrl = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_URL;
  console.log(`✅ Server running on ${url}`);
  if (railwayUrl) {
    console.log(`🌐 Railway public URL: https://${railwayUrl}`);
  }
});
