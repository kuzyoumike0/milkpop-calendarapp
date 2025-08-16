const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const eventsRouter = require('./routes/events');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// APIルート
app.use('/api/events', eventsRouter);

// フロントビルド静的ファイル配信
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA 対応（React Routerがある場合）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
