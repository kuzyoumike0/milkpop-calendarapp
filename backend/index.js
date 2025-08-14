const express = require('express');
const path = require('path');
const app = express();

// APIルート
app.use('/api', require('./routes')); // 必要に応じてルート分け

// 静的ファイル配信
app.use(express.static(path.join(__dirname, 'public')));

// Reactルートを返す
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`サーバー起動: ポート ${process.env.PORT || 8080}`);
});
