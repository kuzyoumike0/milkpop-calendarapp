const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Railway の PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.get("/", (req, res) => {
  res.send("Calendar Backend Running");
});

// 共有リンク生成
app.post("/api/share", async (req, res) => {
  const { title } = req.body;
  const id = uuidv4();
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS shared_events (id TEXT PRIMARY KEY, title TEXT)");
    await pool.query("INSERT INTO shared_events (id, title) VALUES ($1, $2)", [id, title]);
    res.json({ link: `/shared/${id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 共有イベント取得
app.get("/api/share/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM shared_events WHERE id=$1", [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
