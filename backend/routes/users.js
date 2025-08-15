const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id,name,email',
        [name,email,hash]
    );
    res.json(result.rows[0]);
});

router.post('/login', async (req,res) => {
    const { email, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if(user.rows.length === 0) return res.status(400).json({ msg: 'User not found' });
    const valid = await bcrypt.compare(password, user.rows[0].password_hash);
    if(!valid) return res.status(400).json({ msg: 'Invalid password' });
    const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET);
    res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name } });
});

// routes/users.js
router.get("/", auth, async (req,res)=>{
  const users = await pool.query("SELECT id, name FROM users");
  res.json(users.rows);
});


module.exports = router;
