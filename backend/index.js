const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());

// データ読み込み
function readData() {
  if (!fs.existsSync(DATA_FILE)) return { personal: {}, shared: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// データ保存
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 個人スケジュール取得
app.get('/api/personal/:uid', (req, res) => {
  const data = readData();
  res.json(data.personal[req.params.uid] || []);
});

// 個人スケジュール追加
app.post('/api/personal/:uid', (req, res) => {
  const data = readData();
  if (!data.personal[req.params.uid]) data.personal[req.params.uid] = [];
  data.personal[req.params.uid].push(req.body);
  writeData(data);
  res.json({ success: true });
});

// 共有スケジュール取得
app.get('/api/shared', (req, res) => {
  const data = readData();
  res.json(data.shared);
});

// 共有スケジュール追加
app.post('/api/shared', (req, res) => {
  const data = readData();
  data.shared.push(req.body);
  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
