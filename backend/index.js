// 共有リンク発行 API
app.post("/api/shared", async (req, res) => {
  try {
    const { username, title, dates, category, startTime, endTime } = req.body;
    const linkId = uuidv4();

    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (username, title, date, category, start_time, end_time, linkId)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [username, title, d, category, startTime, endTime, linkId]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create share link" });
  }
});
