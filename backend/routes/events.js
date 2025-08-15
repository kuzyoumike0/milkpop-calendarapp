const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// 全イベント取得
router.get('/', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM events ORDER BY date ASC');
    res.json(rows);
});

// 個人イベント作成
router.post('/personal', async (req, res) => {
    const { user_id, date, time_slot, title } = req.body;
    const id = uuidv4();
    const created_at = new Date();
    await pool.query(
        'INSERT INTO personal_events (id, user_id, date, time_slot, title, created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, user_id, date, time_slot, title, created_at]
    );
    res.json({ success: true });
});

// 共有イベント作成
router.post('/shared', async (req, res) => {
    const { date, time_slot, title, created_by } = req.body;
    const id = uuidv4();
    const created_at = new Date();
    await pool.query(
        'INSERT INTO shared_events (id, date, time_slot, title, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, date, time_slot, title, created_by, created_at]
    );
    res.json({ success: true });
});

module.exports = router;
