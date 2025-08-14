const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT  4000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString process.env.DATABASE_URL,
  ssl { rejectUnauthorized false }
});

 ユーザー作成
app.post('users', async (req, res) = {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error 'name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO users (name) VALUES ($1) RETURNING ',
      [name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error 'Error creating user' });
  }
});

 共有カレンダー作成
app.post('shared-calendars', async (req, res) = {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error 'name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO shared_calendars (name, description) VALUES ($1, $2) RETURNING ',
      [name, description  '']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error 'Error creating shared calendar' });
  }
});

 個人スケジュール作成
app.post('personal-schedules', async (req, res) = {
  const { user_id, shared_calendar_id, title, description, start_time, end_time } = req.body;
  if (!user_id  !shared_calendar_id  !title  !start_time  !end_time)
    return res.status(400).json({ error 'Missing required fields' });
  try {
    const result = await pool.query(
      `INSERT INTO personal_schedules
       (user_id, shared_calendar_id, title, description, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING `,
      [user_id, shared_calendar_id, title, description  '', start_time, end_time]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error 'Error creating personal schedule' });
  }
});

 共有カレンダーごとのスケジュール取得
app.get('shared-calendarsidschedules', async (req, res) = {
  const sharedCalendarId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT ps., u.name AS user_name
       FROM personal_schedules ps
       JOIN users u ON ps.user_id = u.id
       WHERE ps.shared_calendar_id = $1
       ORDER BY ps.start_time`,
      [sharedCalendarId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error 'Error fetching schedules' });
  }
});

app.listen(port, () = {
  console.log(`Server running on port ${port}`);
});
