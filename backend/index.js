const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./pool');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend/build'));

// ----- API -----

// 共有カレンダー登録
app.post('/api/shared', async (req, res) => {
  try {
    const { title, time_slot, created_by, date } = req.body;
    const result = await pool.query(
      'INSERT INTO shared_calendar(title, time_slot, created_by, date) VALUES($1,$2,$3,$4) RETURNING *',
      [title, time_slot, created_by, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 個人カレンダー登録
app.post('/api/personal', async (req, res) => {
  try {
    const { shared_id, note, user_id, date } = req.body;
    const result = await pool.query(
      'INSERT INTO personal_calendar(shared_id, note, user_id, date) VALUES($1,$2,$3,$4) RETURNING *',
      [shared_id, note, user_id, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 共有カレンダー取得
app.get('/api/shared', async (req, res) => {
  const { date } = req.query;
  const result = await pool.query(
    'SELECT * FROM shared_calendar WHERE date = $1 ORDER BY time_slot',
    [date]
  );
  res.json(result.rows);
});

// 個人カレンダー取得
app.get('/api/personal/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { date } = req.query;
  const result = await pool.query(
    'SELECT * FROM personal_calendar WHERE user_id=$1 AND date=$2',
    [user_id, date]
  );
  res.json(result.rows);
});

// ----- サーバ起動 -----
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
