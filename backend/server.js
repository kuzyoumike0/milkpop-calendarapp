const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@db:5432/mydb",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// API: 共有リンク作成
app.post("/api/createShareLink", async (req, res) => {
  const shareId = uuidv4();
  try {
    await pool.query(
      "INSERT INTO shared_links (id, created_at) VALUES ($1, NOW())",
      [shareId]
    );
  } catch (err) {
    console.error("DB Insert Error:", err.message);
  }
  res.json({ shareId });
});

// API: イベント取得
app.get("/api/shared/:id/events", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM shared_events WHERE share_id=$1", [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// API: イベント追加
app.post("/api/shared/:id/events", async (req, res) => {
  const { id } = req.params;
  const { title, timeType, startTime, endTime } = req.body;
  try {
    await pool.query(
      "INSERT INTO shared_events (share_id, title, time_type, start_time, end_time) VALUES ($1,$2,$3,$4,$5)",
      [id, title, timeType, startTime, endTime]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
