const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
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
        database: process.env.DB_NAME || "mydb",
        port: process.env.DB_PORT || 5432,
      }
);

// === 共有リンク作成 ===
app.post("/api/create-link", async (req, res) => {
  try {
    const { title } = req.body;
    const linkId = uuidv4();
    await pool.query("INSERT INTO links (linkId, title) VALUES ($1, $2)", [
      linkId,
      title || "無題",
    ]);
    res.json({ linkId });
  } catch (err) {
    console.error("Error creating link:", err);
    res.status(500).send("リンク作成エラー");
  }
});

// === 共有リンク用スケジュール取得 ===
app.get("/api/schedules/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const linkRes = await pool.query(
      "SELECT title FROM links WHERE linkId=$1",
      [linkId]
    );
    const scheduleRes = await pool.query(
      "SELECT username, date, timeslot FROM schedules WHERE linkId=$1",
      [linkId]
    );
    res.json({
      title: linkRes.rows[0]?.title || "無題",
      schedules: scheduleRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("取得エラー");
  }
});

// === スケジュール登録 ===
app.post("/api/schedules/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const { username, date, timeslot } = req.body;
    await pool.query(
      "INSERT INTO schedules (linkId, username, date, timeslot) VALUES ($1,$2,$3,$4)",
      [linkId, username, date, timeslot]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("登録エラー");
  }
});

// === スケジュール削除（自分のものだけ） ===
app.delete("/api/schedules/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const { username, date, timeslot } = req.body;
    await pool.query(
      "DELETE FROM schedules WHERE linkId=$1 AND username=$2 AND date=$3 AND timeslot=$4",
      [linkId, username, date, timeslot]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("削除エラー");
  }
});

// === 本番ビルド提供 ===
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// === サーバー起動 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
