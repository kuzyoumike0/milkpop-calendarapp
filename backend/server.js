const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// === PostgreSQL 接続 ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// === API: 予定取得 ===
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

// === API: 予定追加 ===
app.post('/api/events', async (req, res) => {
  try {
    const { username, note, date, title, timeslot } = req.body;
    await pool.query(
      'INSERT INTO schedules (username, note, date, title, timeslot) VALUES ($1,$2,$3,$4,$5)',
      [username, note, date, title, timeslot]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send('Insert error');
  }
});

// === フロントエンド配信 ===
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
