const express = require('express');
const path = require('path');
const app = express();

// JSONパース
app.use(express.json());

// 静的ファイル提供
app.use(express.static(path.join(__dirname, 'public')));

// APIルート例
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// React ルーティング用キャッチオール
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ポート設定
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ サーバーがポート ${PORT} で起動しました`);
});
