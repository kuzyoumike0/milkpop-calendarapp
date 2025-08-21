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

// === DB初期化 ===
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      time_type TEXT NOT NULL,
      start_time INT,
      end_time INT
    )
  `);
}
initDB();

// === API: スケジュール登録 ===
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, start_date, end_date, time_type, start_time, end_time } = req.body;

    const result = await pool.query(
      `INSERT INTO schedules (title, start_date, end_date, time_type, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [title, start_date, end_date, time_type, start_time || null, end_time || null]
    );

    res.json({ id: result.rows[0].id, message: "スケジュールを登録しました" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "スケジュール登録に失敗しました" });
  }
});

// === API: スケジュール取得 ===
app.get("/api/schedules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM schedules WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "スケジュール取得に失敗しました" });
  }
});

// === API: スケジュール削除 ===
app.delete("/api/schedules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM schedules WHERE id = $1`, [id]);
    res.json({ message: "スケジュールを削除しました" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "スケジュール削除に失敗しました" });
  }
});

// === サーバー起動 ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
