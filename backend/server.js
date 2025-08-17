import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// API: 共有イベント登録
app.post("/api/shared", async (req, res) => {
  const { title, timeSlot, startTime, endTime } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO shared_events (title, timeslot, start_time, end_time) VALUES ($1,$2,$3,$4) RETURNING id",
      [title, timeSlot, startTime, endTime]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 静的ファイル配信
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
