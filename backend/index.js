// === 個人スケジュール登録 ===
app.post("/api/personal-schedule", async (req, res) => {
  const { title, memo, dates, timeslot } = req.body;
  try {
    for (const d of dates) {
      await pool.query(
        "INSERT INTO personal_schedules (title, memo, date, timeslot) VALUES ($1,$2,$3,$4)",
        [title, memo, d, timeslot]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("個人スケジュール登録エラー:", err);
    res.status(500).json({ error: "DB保存に失敗しました" });
  }
});

// === 個人スケジュール取得 ===
app.get("/api/personal-schedule", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM personal_schedules ORDER BY date ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("個人スケジュール取得エラー:", err);
    res.status(500).json({ error: "取得に失敗しました" });
  }
});
