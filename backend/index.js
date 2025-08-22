// backend/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 簡易DB（本番はPostgreSQLを使うとよい）
let schedulesDB = {};   // { shareId: { title, dates, options, responses } }

// ===== スケジュール取得 =====
app.get("/api/schedules/:id", (req, res) => {
  const { id } = req.params;
  const schedule = schedulesDB[id];
  if (!schedule) {
    return res.json({ ok: false, error: "スケジュールが存在しません" });
  }
  res.json({ ok: true, data: schedule });
});

// ===== 出欠保存 =====
app.post("/api/share/:id/respond", (req, res) => {
  const { id } = req.params;
  const { username, responses } = req.body;

  if (!username || !responses) {
    return res.json({ ok: false, error: "必要なデータがありません" });
  }

  if (!schedulesDB[id]) {
    return res.json({ ok: false, error: "スケジュールが存在しません" });
  }

  // responses をスケジュールに保存
  if (!schedulesDB[id].responses) schedulesDB[id].responses = {};
  schedulesDB[id].responses[username] = responses;

  res.json({ ok: true, data: schedulesDB[id] });
});

// ===== 簡易スケジュール登録API（テスト用） =====
// 本来は RegisterPage から呼ばれる想定
app.post("/api/register", (req, res) => {
  const { title, dates, options } = req.body;
  const shareId = uuidv4();

  schedulesDB[shareId] = {
    title,
    dates,
    options,
    responses: {},
  };

  res.json({ ok: true, shareId });
});

// ===== フロントのビルドを提供 =====
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// ===== サーバ起動 =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
