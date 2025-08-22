// スケジュール編集
app.put("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  const { date, time_option, start_hour, end_hour } = req.body;

  try {
    const client = await pool.connect();
    await client.query(
      `UPDATE schedules 
       SET date=$1, time_option=$2, start_hour=$3, end_hour=$4 
       WHERE id=$5`,
      [date, time_option, start_hour, end_hour, id]
    );
    client.release();
    res.json({ success: true });
  } catch (err) {
    console.error("DB update error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// スケジュール削除
app.delete("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    await client.query(`DELETE FROM schedules WHERE id=$1`, [id]);
    client.release();
    res.json({ success: true });
  } catch (err) {
    console.error("DB delete error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
