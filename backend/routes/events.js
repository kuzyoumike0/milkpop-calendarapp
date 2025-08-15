const express = require('express');
const router = express.Router();
const pool = require('../db');

// 個人イベント追加
router.post('/personal', async (req, res) => {
  try {
    const { user_id, date, time_slot, title } = req.body;
    const create_at = new Date();
    await pool.query(
      'INSERT INTO personal_events (user_id, date, time_slot, title, create_at) VALUES ($1,$2,$3,$4,$5)',
      [user_id, date, time_slot, title, create_at]
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
    const create_at = new Date();
    await pool.query(
      'INSERT INTO shared_events (date, time_slot, title, create_by, create_at) VALUES ($1,$2,$3,$4,$5)',
      [date, time_slot, title, create_by, create_at]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 個人イベント取得
router.get('/personal', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personal_events ORDER BY date, time_slot');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 共有イベント取得
router.get('/shared', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shared_events ORDER BY date, time_slot');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 削除 (個人イベント)
router.delete('/personal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM personal_events WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 削除 (共有イベント)
router.delete('/shared/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM shared_events WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
