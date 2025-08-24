// 日程を更新
app.put("/api/schedules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, dates, memo, timerange } = req.body;
    const result = await pool.query(
      `UPDATE schedules 
       SET title=$1, dates=$2, memo=$3, timerange=$4 
       WHERE id=$5 RETURNING *`,
      [title, JSON.stringify(dates), memo || "", timerange || "", id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB更新エラー:", err);
    res.status(500).json({ error: "DB更新エラー" });
  }
});

// 日程を削除
app.delete("/api/schedules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM schedules WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "スケジュールが見つかりません" });
    }
    res.json({ message: "削除しました", deleted: result.rows[0] });
  } catch (err) {
    console.error("DB削除エラー:", err);
    res.status(500).json({ error: "DB削除エラー" });
  }
});
