const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;  // Railway なら PORT に合わせる

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>Calendar App</title>
    </head>
    <body style="font-family:sans-serif; text-align:center; padding:40px;">
      <h1>✅ Calendar App is running</h1>
      <p>PORT: ${PORT}</p>
    </body>
    </html>
  `);
});

// 既存の /share/:id や /api/... ルートもここに続く

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
