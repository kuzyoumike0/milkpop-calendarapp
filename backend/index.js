const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const eventsRouter = require('./routes/events');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// APIルート
app.use('/api/events', eventsRouter);

// React ビルド配信（Docker内でビルド済みのパスに変更）
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
