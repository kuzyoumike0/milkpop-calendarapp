const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// JWT認証ミドルウェア
const auth = (req,res,next) => {
    const token = req.headers['authorization'];
    if(!token) return res.status(401).json({ msg:'No token' });
    try{
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
        req.user = decoded;
        next();
    }catch(e){
        res.status(401).json({ msg:'Invalid token' });
    }
};

// 予定取得（個人+参加共有）
router.get('/', auth, async (req,res) => {
    const events = await pool.query(
        `SELECT e.*, array_agg(ep.user_id) as participants
         FROM events e
         LEFT JOIN event_participants ep ON e.id = ep.event_id
         WHERE e.created_by=$1 OR e.is_shared=true
         GROUP BY e.id`,
        [req.user.id]
    );
    res.json(events.rows);
});

// 予定作成
router.post('/', auth, async (req,res) => {
    const { title, description, date, time_slot, is_shared, participants } = req.body;
    const result = await pool.query(
        'INSERT INTO events (title, description, date, time_slot, created_by, is_shared) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [title, description, date, time_slot, req.user.id, is_shared]
    );
    const event = result.rows[0];
    if(is_shared && participants?.length){
        for(let uid of participants){
            await pool.query('INSERT INTO event_participants (event_id,user_id) VALUES ($1,$2)', [event.id, uid]);
        }
    }
    res.json(event);
});

module.exports = router;
