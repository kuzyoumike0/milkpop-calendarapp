const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// DB設定（省略済み: 前回のまま）

app.use(cors());
app.use(bodyParser.json());

// === APIルート ===
app.post("/api/create-link", async (req, res) => {
  const { title } = req.body;
  const linkId = uuidv4();
  try {
    await pool.query(
      "INSERT INTO schedules (linkId, title, date, timeSlot, username, status) VALUES ($1,$2,$3,$4,$5,$6)",
      [linkId, title || "", "", "", "", ""]
    );
    res.json({ linkId });
  } catch (err) {
    res.status(500).json({ error: "リンク作成失敗" });
  }
});

app.get("/api/schedules/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM schedules WHERE linkId=$1 ORDER BY date, timeSlot",
      [linkId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "取得失敗" });
  }
});

// === Reactビルド配信 ===
const buildPath = path.join(__dirname, "public");
app.use(express.static(buildPath));

// これが超重要: React Router 用の catch-all
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on ${PORT}`);
});
