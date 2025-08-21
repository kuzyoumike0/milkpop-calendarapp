const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(cors());

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

// === API ===

// 登録
app.post("/api/events", async (req, res) => {
  try {
    const { title, dates, timeOption } = req.body;
    const id = uuidv4();

    await pool.query(
      "INSERT INTO events (id, title, dates, time_option) VALUES ($1, $2, $3, $4)",
      [id, title, dates, timeOption]
    );

    res.json({ success: true, id });
  } catch (err) {
    console.error("❌ DB Insert Error", err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

// 取得
app.get("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM events WHERE id=$1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Select Error", err);
    res.status(500).json({ error: "DB select failed" });
  }
});

// === フロント配信 ===
const buildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
