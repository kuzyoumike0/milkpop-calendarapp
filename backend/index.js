const express = require('express');
const path = require('path');
const app = express();

// JSONパース
app.use(express.json());

// 静的ファイル提供（Reactのbuild）
app.use(express.static(path.join(__dirname, 'public')));

// APIルートの例
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Reactルーティング対応
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 環境変数 PORT を優先
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ サーバーがポート ${PORT} で起動しました`);
});
