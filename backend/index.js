const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ===== メモリ保持（デモ用） =====
let events = [];       // 共有/個人どちらも格納
let sharedLinks = {};  // { linkId: events[] }

// ====== API（画面はReactが描画）======

// 共有イベント一覧
app.get("/api/shared", (req, res) => {
  res.json(events);
});

// 個人スケジュール登録
app.post("/api/personal", (req, res) => {
  const event = { id: uuidv4(), ...req.body };
  events.push(event);
  res.json({ success: true, event });
});

// 共有リンク発行
app.post("/api/share/link", (req, res) => {
  const id = uuidv4();
  // 発行時点のスナップショットを保存（以前の仕様）
  sharedLinks[id] = [...events];
  res.json({ id });
});

// 共有リンク先の予定一覧
app.get("/api/share/:id", (req, res) => {
  res.json(sharedLinks[req.params.id] || []);
});

// ===== ここからが重要：静的配信を最優先で設定 =====
// ※ 「/」でテキストを返すルートは置かない！React を返す。
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// React ルーター用フォールバック（トップ/共有/個人/リンク先すべて）
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ===== サーバ起動 =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Backend serving React on http://localhost:${PORT}`);
});
