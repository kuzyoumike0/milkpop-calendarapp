const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// === PostgreSQL 接続 ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// ✅ トップページ（グラスモーフィズム風）
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>Calendar App</title>
      <style>
        body {
          margin: 0;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: "Helvetica Neue", Arial, sans-serif;
          background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);
        }
        .glass {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 40px;
          width: 420px;
          text-align: center;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          color: #fff;
        }
        h1 {
          margin-bottom: 20px;
        }
        .btn {
          display: block;
          margin: 14px auto;
          padding: 14px 20px;
          width: 85%;
          border: none;
          border-radius: 8px;
          font-size: 1em;
          font-weight: bold;
          color: #fff;
          cursor: pointer;
          transition: 0.3s;
          text-decoration: none;
        }
        .btn.green {
          background: #27ae60;
        }
        .btn.green:hover {
          background: #219150;
        }
        .btn.blue {
          background: #2980b9;
        }
        .btn.blue:hover {
          background: #1f6391;
        }
      </style>
    </head>
    <body>
      <div class="glass">
        <h1>📅 Calendar App</h1>
        <a class="btn green" href="/api/share-link">➕ 新しい予定を共有</a>
        <a class="btn blue" href="/share/demo123">🔗 サンプル共有リンクを見る</a>
      </div>
    </body>
    </html>
  `);
});

// ✅ 共有リンク発行 API
app.post("/api/share-link", async (req, res) => {
  const { dates, slotMode, slot, start_time, end_time, title } = req.body;
  const shareId = uuidv4();

  try {
    await pool.query(
      `INSERT INTO share_links (id, dates, slotMode, slot, start_time, end_time, title)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [shareId, dates, slotMode, slot, start_time, end_time, title]
    );

    res.json({
      url: `${
        process.env.BASE_URL || "http://localhost:" + PORT
      }/share/${shareId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("DBエラー");
  }
});

// ✅ 共有リンクの表示
app.get("/share/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM share_links WHERE id=$1", [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).send("リンクが無効です");

    const data = result.rows[0];

    res.send(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <title>共有された予定</title>
        <style>
          body {
            font-family: "Helvetica Neue", Arial, sans-serif;
            background: #ecf0f1;
            color: #2c3e50;
            padding: 40px;
            line-height: 1.6;
          }
          h1 {
            color: #2c3e50;
            text-align: center;
          }
          .card {
            max-width: 600px;
            margin: 20px auto;
            padding: 24px;
            border-radius: 16px;
            background: rgba(255,255,255,0.8);
            backdrop-filter: blur(10px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          }
          .title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2980b9;
          }
          .dates {
            font-size: 1.1em;
            margin: 8px 0;
            color: #27ae60;
          }
          .slot {
            font-size: 1em;
            margin-top: 8px;
            color: #2c3e50;
          }
          .back-btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            border-radius: 6px;
            background: #2980b9;
            color: white;
            text-decoration: none;
            transition: background 0.3s;
          }
          .back-btn:hover {
            background: #1f6391;
          }
        </style>
      </head>
      <body>
        <h1>📅 共有された予定</h1>
        <div class="card">
          <div class="title">${data.title || "（無題）"}</div>
          <div class="dates">日程: ${Array.isArray(data.dates) ? data.dates.join(", ") : data.dates}</div>
          <div class="slot">
            区分: ${
              data.slotmode === "allday"
                ? data.slot
                : `${data.start_time}:00〜${data.end_time}:00`
            }
          </div>
          <div style="text-align:center;">
            <a class="back-btn" href="/">⬅ 戻る</a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("DBエラー");
  }
});

// === サーバー起動 ===
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
