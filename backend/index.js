// === スケジュール登録 ===
app.post("/api/schedule", async (req, res) => {
  try {
    const { title, start_date, end_date, timeslot, range_mode, dates } = req.body;
    const linkid = uuidv4();

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ success: false, error: "必須項目が未入力です" });
    }

    if (range_mode === "複数選択" && Array.isArray(dates) && dates.length > 0) {
      // 複数日 → 選択された日ごとに保存
      const inserted = [];
      for (const d of dates) {
        const result = await pool.query(
          `INSERT INTO schedules (title, memo, start_date, end_date, timeslot, range_mode, linkid)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
          [title, null, d, d, timeslot, range_mode, linkid]
        );
        inserted.push(result.rows[0]);
      }
      return res.json({ success: true, schedules: inserted, url: `/share/${linkid}` });
    } else {
      // 範囲選択（単一日も含む）
      const result = await pool.query(
        `INSERT INTO schedules (title, memo, start_date, end_date, timeslot, range_mode, linkid)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [title, null, start_date, end_date, timeslot, range_mode, linkid]
      );
      return res.json({ success: true, schedule: result.rows[0], url: `/share/${linkid}` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "登録失敗" });
  }
});
