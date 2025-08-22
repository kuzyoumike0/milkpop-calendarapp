const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());

// ===== メモリ保存（本番はDB推奨） =====
let shareData = {}; // { id: { schedules: [...], responses: [...] } }

// ===== 日程登録API =====
app.post("/api/schedules", (req, res) => {
  console.log("📥 受信:", req.body);

  const id = uuidv4();
  shareData[id] = {
    schedules: req.body.schedules || [],
    responses: [],
  };

  res.json({ ok: true, id, url: `/share/${id}` });
});

// ===== 共有ページのデータ取得 =====
app.get("/api/share/:id", (req, res) => {
  const id = req.params.id;
  if (!shareData[id]) {
    return res.status(404).json({ error: "共有データが存在しません" });
  }
  res.json(shareData[id]);
});

// ===== 参加者の回答保存 =====
app.post("/api/share/:id/responses", (req, res) => {
  const id = req.params.id;
  const { responses } = req.body;

  if (!shareData[id]) {
    return res.status(404).json({ error: "共有データが存在しません" });
  }

  // 回答を追加保存
  shareData[id].responses = (shareData[id].responses || []).concat(responses);

  res.json({ ok: true, responses: shareData[id].responses });
});

// ===== Reactビルド配信 =====
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ===== サーバー起動 =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
