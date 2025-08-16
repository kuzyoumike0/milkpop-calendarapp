import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// メモリ内データストア（DBなしでエラー回避）
let personalEvents = []; // {id, user, title, date, time_slot, created_at}
let sharedEvents = [];   // {id, title, date, time_slot, created_by, created_at}
let events = [];         // {id, title, date, created_at}
let seq = 1;

// 個人スケジュール登録
app.post('/api/personal', (req, res) => {
  const { user, title, date, time_slot } = req.body;
  const item = { id: seq++, user, title, date, time_slot, created_at: new Date().toISOString() };
  personalEvents.push(item);
  // 紐づけ：共有表示には個人も含める（created_by=user としてマージ表示）
  res.json({ success: true, item });
});

// 個人スケジュール一覧
app.get('/api/personal', (req, res) => {
  res.json(personalEvents);
});

// 共有スケジュール登録（任意）
app.post('/api/shared', (req, res) => {
  const { title, date, time_slot, created_by } = req.body;
  const item = { id: seq++, title, date, time_slot, created_by, created_at: new Date().toISOString() };
  sharedEvents.push(item);
  res.json({ success: true, item });
});

// 共有スケジュール一覧（個人も含めて返す）
app.get('/api/shared', (req, res) => {
  const merged = [
    ...sharedEvents,
    ...personalEvents.map(p => ({
      id: `p-${p.id}`,
      title: p.title,
      date: p.date,
      time_slot: p.time_slot,
      created_by: p.user,
      created_at: p.created_at
    }))
  ];
  res.json(merged);
});

// イベント登録/一覧
app.post('/api/events', (req, res) => {
  const { title, date } = req.body;
  const item = { id: seq++, title, date, created_at: new Date().toISOString() };
  events.push(item);
  res.json({ success: true, item });
});
app.get('/api/events', (req, res) => res.json(events));

// 静的ファイル（フロントビルド成果物）
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
