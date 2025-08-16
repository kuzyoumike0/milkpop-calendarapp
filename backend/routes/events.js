const express = require('express');
const router = express.Router();
const pool = require('../db');

// 個人イベント追加
router.post('/personal', async (req, res) => {
  const { user_id, date, time_slot, title } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO personal_events (user_id, date, time_slot, title) VALUES ($1,$2,$3,$4) RETURNING *',
      [user_id, date, time_slot, title]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '個人イベント追加エラー' });
  }
});

// 個人イベント取得
router.get('/personal', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personal_events ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '取得エラー' });
  }
});

// 共有イベント追加
router.post('/shared', async (req, res) => {
  const { date, time_slot, title, created_by } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO shared_events (date, time_slot, title, created_by) VALUES ($1,$2,$3,$4) RETURNING *',
      [date, time_slot, title, created_by]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '共有イベント追加エラー' });
  }
});

// 共有イベント取得
router.get('/shared', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shared_events ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '取得エラー' });
  }
});

module.exports = router;
