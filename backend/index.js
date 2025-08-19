const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// 共有スケジュール取得
app.get("/api/shared", async (req, res) => {
  try {
    const { date } = req.query;
    const result = await pool.query(
      "SELECT * FROM schedules WHERE date = $1 ORDER BY timeslot",
      [date]
    );
    // ✅ rows だけ返すように変更（フロントで map できる）
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching shared schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

// 共有リンク発行
app.post("/api/share", async (req, res) => {
  try {
    const linkId = uuidv4();
    await pool.query("INSERT INTO share_links (id) VALUES ($1)", [linkId]);
    res.json({ linkId });
  } catch (err) {
    console.error("❌ Error creating share link:", err);
    res.status(500).json({ error: "Failed to create share link" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
