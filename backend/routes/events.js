// routes/events.js
import express from 'express';
const router = express.Router();

let personalEvents = [];
let sharedEvents = [];

router.get('/personal', (req, res) => res.json(personalEvents));
router.post('/personal', (req, res) => {
  const { title } = req.body;
  personalEvents.push({ title });
  res.json({ message: '追加完了' });
});

router.get('/shared', (req, res) => res.json(sharedEvents));
router.post('/shared', (req, res) => {
  const { title } = req.body;
  sharedEvents.push({ title });
  res.json({ message: '追加完了' });
});

export default router;
