// 保存API（新しい共有URLを生成）
app.post("/api/saveSchedule", async (req, res) => {
  try {
    const { title, date, timeType, startTime, endTime } = req.body;
    const scheduleId = uuidv4();
    const shareId = uuidv4();
    const shareUrl = `https://yourdomain.com/share/${shareId}`;

    // スケジュール保存
    await pool.query(
      "INSERT INTO schedules (id, title, date, time_type, start_time, end_time) VALUES ($1,$2,$3,$4,$5,$6)",
      [scheduleId, title, date, timeType, startTime, endTime]
    );

    // 共有リンク保存
    await pool.query(
      "INSERT INTO share_links (id, schedule_id, url) VALUES ($1,$2,$3)",
      [shareId, scheduleId, shareUrl]
    );

    res.json({ success: true, shareUrl });
  } catch (err) {
    console.error("保存エラー:", err);
    res.status(500).json({ success: false });
  }
});

// 保存済みリンクを取得
app.get("/api/shareLinks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM share_links ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("取得エラー:", err);
    res.status(500).json({ success: false });
  }
});
