const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL接続設定ファイル
const { v4: uuidv4 } = require('uuid');

// 個人イベント追加
router.post('/personal', async (req, res) => {
  try {
    const { user_id, date, time_slot, title } = req.body;
    const created_at = new Date();
    await pool.query(
      'INSERT INTO personal_events (user_id, date, time_slot, title, create_at) VALUES ($1,$2,$3,$4,$5)',
      [user_id, date, time_slot, title, created_at]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 共有イベント追加
router.post('/shared', async (req, res) => {
  try {
    const { date, time_slot, title, create_by } = req.body;
    const created_at = new Date();
    await pool.query(
      'INSERT INTO shared_events (date, time_slot, title, create_by, create_at) VALUES ($1,$2,$3,$4,$5)',
      [date, time_slot, title, create_by, created_at]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 全イベント取得
router.get('/personal', async (req, res) => {
  const result = await pool.query('SELECT * FROM personal_events ORDER BY date, time_slot');
  res.json(result.rows);
});

router.get('/shared', async (req, res) => {
  const result = await pool.query('SELECT * FROM shared_events ORDER BY date, time_slot');
  res.json(result.rows);
});

module.exports = router;
