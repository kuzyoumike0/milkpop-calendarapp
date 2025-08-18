const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");
const app = express();

app.use(bodyParser.json());

// === PostgreSQL 接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_schedules (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      title TEXT NOT NULL,
      username TEXT NOT NULL
    );
  `);
}
initDB();

// === 予定取得 ===
app.get("/api/shared", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "date is required" });

    const result = await pool.query(
      "SELECT id, date, title, username FROM shared_schedules WHERE date = $1 ORDER BY id ASC",
      [date]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("予定取得エラー:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// === 予定追加 ===
app.post("/api/shared", async (req, res) => {
  try {
    const { date, title, username } = req.body;
    if (!date || !title || !username) {
      return res.status(400).json({ error: "date, title, username are required" });
    }

    await pool.query(
      "INSERT INTO shared_schedules (date, title, username) VALUES ($1, $2, $3)",
      [date, title, username]
    );

    res.status(201).json({ message: "Event added successfully" });
  } catch (err) {
    console.error("予定追加エラー:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// === 予定編集 ===
app.put("/api/shared/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, username } = req.body;

    if (!title || !username) {
      return res.status(400).json({ error: "title and username are required" });
    }

    const result = await pool.query(
      "UPDATE shared_schedules SET title = $1 WHERE id = $2 AND username = $3 RETURNING *",
      [title, id, username]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Not authorized or event not found" });
    }

    res.json({ message: "Event updated successfully", event: result.rows[0] });
  } catch (err) {
    console.error("予定編集エラー:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// === 予定削除 ===
app.delete("/api/shared/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }

    const result = await pool.query(
      "DELETE FROM shared_schedules WHERE id = $1 AND username = $2 RETURNING *",
      [id, username]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Not authorized or event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("予定削除エラー:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// === 静的ファイル配信 (React ビルド済み) ===
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
