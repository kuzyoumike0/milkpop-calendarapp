// === 新しいリンク発行 & 複数予定追加 ===
app.post("/api/shared", async (req, res) => {
  try {
    const { dates, title, username, timeInfo } = req.body;
    if (!dates || dates.length === 0 || !title || !username) {
      return res.status(400).json({ error: "dates, title, username are required" });
    }

    // 新しいリンクIDを発行
    const linkId = uuidv4();
    await pool.query("INSERT INTO shared_links (id) VALUES ($1)", [linkId]);

    // 予定をまとめて登録
    for (const d of dates) {
      await pool.query(
        "INSERT INTO shared_schedules (link_id, date, title, username) VALUES ($1, $2, $3, $4)",
        [linkId, d, `${title} (${timeInfo})`, username]
      );
    }

    res.status(201).json({ message: "Events added successfully", linkId });
  } catch (err) {
    console.error("予定追加エラー:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
