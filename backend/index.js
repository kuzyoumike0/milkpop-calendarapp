// 共有リンク作成
app.post("/api/shared", async (req, res) => {
  const { dates, username, category, startTime, endTime } = req.body;

  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({ error: "日付が必要です" });
  }

  try {
    // 新しい linkId を発行
    const linkId = uuidv4();

    // すべての選択日を DB に保存
    for (const d of dates) {
      await pool.query(
        `INSERT INTO schedules (linkId, date, username, category, startTime, endTime)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [linkId, d, username, category, startTime, endTime]
      );
    }

    res.json({ linkId });
  } catch (err) {
    console.error("共有リンク作成エラー:", err);
    res.status(500).json({ error: "共有リンクの作成に失敗しました" });
  }
});

// 共有リンクから予定を取得
app.get("/api/shared/:linkId", async (req, res) => {
  const { linkId } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, date, username, category, startTime, endTime FROM schedules WHERE linkId=$1 ORDER BY date ASC",
      [linkId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("共有リンク取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});
