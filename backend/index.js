// === 新しいリンク発行 & 複数予定追加 ===
app.post("/api/shared", async (req, res) => {
  try {
    const { dates, title, username, timeInfo } = req.body;
    if (!dates || dates.length === 0 || !title || !username || !timeInfo) {
      return res.status(400).json({ error: "dates, title, username, timeInfo are required" });
    }

    // 新しいリンクIDを発行
    const linkId = uuidv4();
    await pool.query("INSERT INTO shared_links (id) VALUES ($1)", [linkId]);

    // 予定をまとめて登録
    for (const d of dates) {
      await pool.query(
        "INSERT INTO shared_schedules (link_id, date, title, username, time_info) VALUES ($1, $2, $3, $4, $5)",
        [linkId, d, title, username, timeInfo]
      );
    }

    res.status(201).json({ message: "Events added successfully", linkId });
  } catch (err) {
    console.error("予定追加エラー:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// === リンクページの予定一覧 ===
app.get("/api/sharelink/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, date, title, username, time_info FROM shared_schedules WHERE link_id = $1 ORDER BY date ASC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有リンク取得エラー:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
