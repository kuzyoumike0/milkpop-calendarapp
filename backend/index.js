const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const eventsRouter = require('./routes/events');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/events', eventsRouter);

// 静的ファイル配信（Viteビルド結果）
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA対応
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
