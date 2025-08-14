const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// 共有カレンダー追加
app.post('/api/shared', async (req, res) => {
  const { date, time_slot, title, created_by } = req.body;
  try {
    const shared = await pool.query(
      'INSERT INTO shared_events(date, time_slot, title, created_by) VALUES($1,$2,$3,$4) RETURNING *',
      [date, time_slot, title, created_by]
    );
    // 作成者用の個人カレンダーにも追加
    await pool.query(
      'INSERT INTO personal_events(user_id, date, time_slot, title) VALUES($1,$2,$3,$4)',
      [created_by, date, time_slot, title]
    );
    res.json(shared.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('DBエラー');
  }
});

// 個人カレンダー追加
app.post('/api/personal', async (req, res) => {
  const { user_id, date, time_slot, title } = req.body;
  try {
    const personal = await pool.query(
      'INSERT INTO personal_events(user_id, date, time_slot, title) VALUES($1,$2,$3,$4) RETURNING *',
      [user_id, date, time_slot, title]
    );
    res.json(personal.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('DBエラー');
  }
});

// 共有カレンダー取得
app.get('/api/shared', async (req, res) => {
  const { date } = req.query;
  const result = await pool.query(
    'SELECT * FROM shared_events WHERE date=$1 ORDER BY time_slot',
    [date]
  );
  res.json(result.rows);
});

// 個人カレンダー取得
app.get('/api/personal', async (req, res) => {
  const { user_id, date } = req.query;
  const result = await pool.query(
    'SELECT * FROM personal_events WHERE user_id=$1 AND date=$2 ORDER BY time_slot',
    [user_id, date]
  );
  res.json(result.rows);
});

app.listen(process.env.PORT || 8080, () => console.log('サーバー起動'));
