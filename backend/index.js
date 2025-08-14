// 共有カレンダーに追加
app.post('/api/shared', async (req, res) => {
  const { title, time_slot, created_by, date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO shared_events(title, time_slot, created_by, date) VALUES($1, $2, $3, $4) RETURNING *',
      [title, time_slot, created_by, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '共有カレンダー追加失敗' });
  }
});

// 個人カレンダーに追加
app.post('/api/personal', async (req, res) => {
  const { title, time_slot, user_id, date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO personal_events(title, time_slot, user_id, date) VALUES($1, $2, $3, $4) RETURNING *',
      [title, time_slot, user_id, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '個人カレンダー追加失敗' });
  }
});
