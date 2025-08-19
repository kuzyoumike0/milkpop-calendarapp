// 予定編集 (本人だけ)
app.put("/api/shared/:linkId/:id", async (req, res) => {
  const { linkId, id } = req.params;
  const { username, date, category, startTime, endTime } = req.body;

  try {
    const result = await pool.query(
      `UPDATE schedules
       SET date=$1, category=$2, startTime=$3, endTime=$4
       WHERE id=$5 AND linkId=$6 AND username=$7
       RETURNING *`,
      [date, category, startTime, endTime, id, linkId, username]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "編集できません（本人以外）" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("編集失敗:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});
