const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL 設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT || 5432,
      }
);

// === API ===

// 共有リンク発行（予定まとめて登録）
app.post("/api/sharelink", async (req, res) => {
  try {
    const { dates, category, startTime, endTime, username = "anonymous" } = req.body;
    const linkId = uuidv4();

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (linkId, username, date, category, startTime, endTime)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [linkId, username, d, category, startTime, endTime]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("Error in /api/sharelink", err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

// 共有ページ取得
app.get("/api/share/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const result = await pool.query(
      `SELECT id, username, date, category, startTime, endTime
       FROM schedules
       WHERE linkId = $1
       ORDER BY date ASC`,
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error in /api/share/:linkId", err);
    res.status(500).json({ error: "DB fetch failed" });
  }
});

// React のビルド済みファイルを配信
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
