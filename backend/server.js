// backend/server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

// ★ 既存の Google OAuth 設定がある前提（/auth/google/login 等）
//   -> ここではセッションに { user: { email, name, picture } } が入る想定。
//   -> もし未設定なら、あとで /auth/google/* 実装を差し込みます。

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
  })
);

// 静的ファイル（Vite ビルド成果物）を配信する想定
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// メモリ上のデータ（DBの代わり）
let personalEvents = []; // { id, user, title, memo, date, time_slot, created_at }
let sharedEvents = [];   // { id, title, date, time_slot, created_by, created_at }

// -------------------
// Auth ガード（ログイン必須）
// -------------------
function requireAuth(req, res, next) {
  try {
    if (req.session && req.session.user && req.session.user.email) {
      return next();
    }
    return res.status(401).json({ error: 'auth_required' });
  } catch (e) {
    return res.status(401).json({ error: 'auth_required' });
  }
}

// 現在ログイン情報
app.get('/api/me', (req, res) => {
  const u = req.session?.user;
  if (!u) return res.json({ loggedIn: false });
  return res.json({
    loggedIn: true,
    email: u.email,
    name: u.name,
    picture: u.picture,
  });
});

// -------------------
// 個人スケジュール（ユーザー単位）: ログイン必須
// -------------------

// 一覧（自分のもののみ）
app.get('/api/personal', requireAuth, (req, res) => {
  const email = req.session.user.email;
  const rows = personalEvents.filter((e) => e.user === email);
  res.json(rows);
});

// 追加（user はセッションの email を強制）
app.post('/api/personal', requireAuth, (req, res) => {
  const { title, memo = '', date, time_slot } = req.body;
  const user = req.session.user.email;
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
  const created_at = new Date().toISOString();
  const item = { id, user, title, memo, date, time_slot, created_at };
  personalEvents.push(item);
  res.json({ success: true, item });
});

// 削除（自分のものだけ削除可）
app.delete('/api/personal/:id', requireAuth, (req, res) => {
  const email = req.session.user.email;
  const { id } = req.params;
  const before = personalEvents.length;
  personalEvents = personalEvents.filter((e) => !(e.id === id && e.user === email));
  const removed = before !== personalEvents.length;
  res.json({ success: removed });
});

// -------------------
// 共有スケジュール: ログイン必須 & ユーザー別フィルタ
// -------------------

// 一覧（自分が created_by のものだけ）
app.get('/api/shared', requireAuth, (req, res) => {
  const email = req.session.user.email;
  const rows = sharedEvents.filter((e) => e.created_by === email);
  res.json(rows);
});

// 追加（created_by はセッションの email を強制）
app.post('/api/shared', requireAuth, (req, res) => {
  const { title, date, time_slot } = req.body;
  const created_by = req.session.user.email;
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
  const created_at = new Date().toISOString();
  const item = { id, title, date, time_slot, created_by, created_at };
  sharedEvents.push(item);
  res.json({ success: true, item });
});

// 削除（自分の created_by のものだけ削除可）
app.delete('/api/shared/:id', requireAuth, (req, res) => {
  const email = req.session.user.email;
  const { id } = req.params;
  const before = sharedEvents.length;
  sharedEvents = sharedEvents.filter((e) => !(e.id === id && e.created_by === email));
  const removed = before !== sharedEvents.length;
  res.json({ success: removed });
});

// -------------------
// ルーティング（フロント SPA）
// -------------------
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// -------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
