const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@db:5432/postgres',
});

// Create schedules table
(async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    link_id TEXT,
    title TEXT,
    username TEXT,
    memo TEXT,
    date DATE,
    start_time TEXT,
    end_time TEXT
  )`);
})();

// Create new share link
app.post('/api/share', async (req, res) => {
  const { title } = req.body;
  const linkId = uuidv4();
  await pool.query('INSERT INTO schedules (link_id, title) VALUES ($1, $2)', [linkId, title]);
  res.json({ link: `/share/${linkId}` });
});

// Get schedules by link id
app.get('/api/share/:linkId', async (req, res) => {
  const { linkId } = req.params;
  const result = await pool.query('SELECT * FROM schedules WHERE link_id=$1', [linkId]);
  res.json(result.rows);
});

// Add schedule to link
app.post('/api/share/:linkId/add', async (req, res) => {
  const { linkId } = req.params;
  const { username, memo, date, start_time, end_time } = req.body;
  const result = await pool.query('INSERT INTO schedules (link_id, username, memo, date, start_time, end_time) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [linkId, username, memo, date, start_time, end_time]);
  res.json(result.rows[0]);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
