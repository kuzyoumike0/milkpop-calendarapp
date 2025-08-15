const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// 個人イベント追加
router.post('/personal', async (req, res) => {
  try {
    const { user_id, date, time_slot, title } = req.body;
    const id = uuidv4();
    const create_at = new Date(); // DBカラム名に合わせる
    await pool.query(
      'INSERT INTO personal_events (id, user_id, date, time_slot, title, create_at) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, user_id, date, time_slot, title, create_at]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('DB追加エラー:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// 個人イベント取得
router.get('/personal', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personal_events ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 共有イベント追加
router.post('/shared', async (req, res) => {
  try {
    const { date, time_slot, title, create_by } = req.body;
    const id = uuidv4();
    const create_at = new Date();
    await pool.query(
      'INSERT INTO shared_events (id, date, time_slot, title, create_by, create_at) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, date, time_slot, title, create_by, create_at]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 共有イベント取得
router.get('/shared', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shared_events ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
