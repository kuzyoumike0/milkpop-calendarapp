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

// ✅ 必ず / を定義
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
          width: 400px;
          text-align: center;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          color: #fff;
        }
        h1 {
          margin-bottom: 20px;
        }
        .btn {
          display: block;
          margin: 12px auto;
          padding: 12px 20px;
          width: 80%;
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
