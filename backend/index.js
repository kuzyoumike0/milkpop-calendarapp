// === 参加者追加（新規・更新兼用）===
app.post("/api/participant", async (req, res) => {
  try {
    const { linkId, date, timeslot, username, status } = req.body;

    // schedules.id を取得
    const result = await pool.query(
      `SELECT id FROM schedules WHERE linkId = $1 AND date = $2 AND timeslot = $3`,
      [linkId, date, timeslot]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "該当するスケジュールが見つかりません" });
    }

    const scheduleId = result.rows[0].id;

    await pool.query(
      `INSERT INTO participants (scheduleId, username, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (scheduleId, username)
       DO UPDATE SET status = EXCLUDED.status`,
      [scheduleId, username, status]
    );

    res.json({ message: "参加者を追加・更新しました" });
  } catch (err) {
    console.error("参加者追加エラー:", err);
    res.status(500).json({ error: "参加者追加に失敗しました" });
  }
});

// === 参加者削除 ===
app.delete("/api/participant", async (req, res) => {
  try {
    const { linkId, date, timeslot, username } = req.body;

    // schedules.id を取得
    const result = await pool.query(
      `SELECT id FROM schedules WHERE linkId = $1 AND date = $2 AND timeslot = $3`,
      [linkId, date, timeslot]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "該当するスケジュールが見つかりません" });
    }

    const scheduleId = result.rows[0].id;

    await pool.query(
      `DELETE FROM participants WHERE scheduleId = $1 AND username = $2`,
      [scheduleId, username]
    );

    res.json({ message: "参加者を削除しました" });
  } catch (err) {
    console.error("参加者削除エラー:", err);
    res.status(500).json({ error: "参加者削除に失敗しました" });
  }
});

// === 参加者編集 ===
app.put("/api/participant", async (req, res) => {
  try {
    const { linkId, date, timeslot, username, status } = req.body;

    // schedules.id を取得
    const result = await pool.query(
      `SELECT id FROM schedules WHERE linkId = $1 AND date = $2 AND timeslot = $3`,
      [linkId, date, timeslot]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "該当するスケジュールが見つかりません" });
    }

    const scheduleId = result.rows[0].id;

    await pool.query(
      `UPDATE participants
       SET status = $1
       WHERE scheduleId = $2 AND username = $3`,
      [status, scheduleId, username]
    );

    res.json({ message: "参加者情報を編集しました" });
  } catch (err) {
    console.error("参加者編集エラー:", err);
    res.status(500).json({ error: "参加者編集に失敗しました" });
  }
});
