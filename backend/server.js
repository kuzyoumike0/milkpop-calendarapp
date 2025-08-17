const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 共有カレンダー予定
app.post('/api/events', async (req, res) => {
  try {
    const { title, start_date, end_date, username, memo } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO events (id, title, start_date, end_date, username, memo) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, title, start_date, end_date, username, memo]
    );
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting event');
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY start_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Error fetching events');
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start_date, end_date, username, memo } = req.body;
    await pool.query(
      'UPDATE events SET title=$1, start_date=$2, end_date=$3, username=$4, memo=$5 WHERE id=$6',
      [title, start_date, end_date, username, memo, id]
    );
    res.json({ status: 'updated' });
  } catch (err) {
    res.status(500).send('Error updating event');
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM events WHERE id=$1', [id]);
    res.json({ status: 'deleted' });
  } catch (err) {
    res.status(500).send('Error deleting event');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
