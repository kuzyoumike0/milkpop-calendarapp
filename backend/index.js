const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

// DB 接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ✅ GET / のルート
app.get("/", (req, res) => {
  res.send("✅ Calendar backend is running");
});

// 共有リンク発行
app.post("/api/share-link", async (req, res) => {
  const { dates, slotMode, slot, start_time, end_time, title } = req.body;
  const shareId = uuidv4();

  try {
    await pool.query(
      `INSERT INTO share_links (id, dates, slotMode, slot, start_time, end_time, title)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [shareId, dates, slotMode, slot, start_time, end_time, title]
    );

    res.json({ url: `${process.env.BASE_URL || "http://localhost:8080"}/share/${shareId}` });
  } catch (err) {
    console.error(err);
    res.status(500).send("DBエラー");
  }
});

// ✅ HTML で予定を表示
app.get("/share/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM share_links WHERE id=$1", [id]);
    if (result.rows.length === 0) return res.status(404).send("リンクが無効です");

    const data = result.rows[0];

    // HTML生成
    let html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <title>共有された予定</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #2c3e50; }
          .card {
            border: 1px solid #ccc; 
            border-radius: 8px; 
            padding: 16px; 
            margin: 8px 0;
            background: #f9f9f9;
          }
          .dates { font-weight: bold; color: #27ae60; }
          .slot { color: #2980b9; }
        </style>
      </head>
      <body>
        <h1>📅 共有された予定</h1>
        <div class="card">
          <div><strong>タイトル:</strong> ${data.title}</div>
          <div class="dates"><strong>日程:</strong> ${data.dates.join(", ")}</div>
          <div class="slot"><strong>区分:</strong> ${data.slotMode === "allday" ? data.slot : `${data.start_time}:00〜${data.end_time}:00`}</div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("DBエラー");
  }
});

app.listen(8080, () => {
  console.log("✅ Server running on http://localhost:8080");
});
