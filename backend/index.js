// 予定削除 (本人だけ)
app.delete("/api/shared/:linkId/:id", async (req, res) => {
  const { linkId, id } = req.params;
  const { username } = req.body; // フロントから送る

  try {
    const result = await pool.query(
      "DELETE FROM schedules WHERE id=$1 AND linkId=$2 AND username=$3 RETURNING *",
      [id, linkId, username]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "削除できません（本人以外）" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("削除失敗:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});
