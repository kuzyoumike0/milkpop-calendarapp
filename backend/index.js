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

// フロントビルド配信
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
