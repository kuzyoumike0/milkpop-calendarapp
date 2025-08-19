app.post("/api/create-link", async (req, res) => {
  const { title, dates, timeslot } = req.body;
  if (!Array.isArray(dates)) {
    return res.status(400).json({ error: "dates must be an array" });
  }
  try {
    const linkId = uuidv4();
    await pool.query("INSERT INTO links (id, title) VALUES ($1, $2)", [
      linkId,
      title,
    ]);

    for (const d of dates) {
      await pool.query(
        "INSERT INTO schedules (link_id, date, timeslot) VALUES ($1, $2, $3)",
        [linkId, d, timeslot || "全日"]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("リンク作成エラー:", err);
    res.status(500).json({ error: "リンク作成失敗" });
  }
});
