// 共有カレンダーのデータ登録
app.post('/api/shared', async (req, res) => {
  try {
    const { user, dayType, date } = req.body;
    const result = await pool.query(
      'INSERT INTO shared_events(username, day_type, date) VALUES($1, $2, $3) RETURNING *',
      [user, dayType, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 個人カレンダーのデータ登録
app.post('/api/personal', async (req, res) => {
  try {
    const { user, dayType, date } = req.body;
    const result = await pool.query(
      'INSERT INTO personal_events(username, day_type, date) VALUES($1, $2, $3) RETURNING *',
      [user, dayType, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
