// 予定を削除（本人のみ）
app.delete("/api/schedule/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body; // フロントから送る

    // 本人の予定だけ削除
    const result = await pool.query(
      `DELETE FROM schedules WHERE id = $1 AND username = $2 RETURNING *`,
      [id, username]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "削除できません（本人以外）" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});
