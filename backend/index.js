// backend/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== 簡易DB =====
let schedulesDB = {};   // 共有スケジュール: { shareId: { title, dates, options, responses } }
let personalDB = {};    // 個人スケジュール: { userId: { id, title, memo, dates, options, createdAt }[] }

// ===== スケジュール取得（共有用） =====
app.get("/api/schedules/:id", (req, res) => {
  const { id } = req.params;
  const schedule = schedulesDB[id];
  if (!schedule) {
    return res.json({ ok: false, error: "スケジュールが存在しません" });
  }
  res.json({ ok: true, data: schedule });
});

// ===== 出欠保存（共有用） =====
app.post("/api/share/:id/respond", (req, res) => {
  const { id } = req.params;
  const { username, responses } = req.body;

  if (!username || username.trim() === "") {
    return res.json({ ok: false, error: "ユーザー名が必要です" });
  }

  if (!schedulesDB[id]) {
    return res.json({ ok: false, error: "スケジュールが存在しません" });
  }

  const safeResponses = responses && typeof responses === "object" ? responses : {};
  if (!schedulesDB[id].responses) schedulesDB[id].responses = {};
  schedulesDB[id].responses[username] = safeResponses;

  res.json({ ok: true, data: schedulesDB[id] });
});

// ===== 共有スケジュール登録 =====
app.post("/api/register", (req, res) => {
  const { title, dates, options } = req.body;
  if (!title || !dates) {
    return res.json({ ok: false, error: "タイトルと日程が必須です" });
  }

  const shareId = uuidv4();
  schedulesDB[shareId] = {
    title,
    dates,
    options,
    responses: {},
  };

  res.json({ ok: true, shareId });
});

// ===== 個人スケジュール登録（ユーザーごと） =====
app.post("/api/personal", (req, res) => {
  try {
    const { userId, title, memo, dates, options } = req.body;
    if (!userId) {
      return res.json({ ok: false, error: "userId が必要です" });
    }
    if (!title || !dates || dates.length === 0) {
      return res.json({ ok: false, error: "タイトルと日程が必須です" });
    }

    const id = uuidv4();
    const newSchedule = {
      id,
      title,
      memo: memo || "",
      dates,
      options,
      createdAt: new Date().toISOString(),
    };

    if (!personalDB[userId]) personalDB[userId] = [];
    personalDB[userId].push(newSchedule);

    console.log(`✅ 個人スケジュール保存: userId=${userId}`, newSchedule);
    res.json({ ok: true, id });
  } catch (err) {
    console.error("❌ /api/personal エラー:", err);
    res.json({ ok: false, error: err.message });
  }
});

// ===== 個人スケジュール一覧取得（ユーザーごと） =====
app.get("/api/personal/:userId", (req, res) => {
  const { userId } = req.params;
  const list = personalDB[userId] || [];
  res.json({ ok: true, list });
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
