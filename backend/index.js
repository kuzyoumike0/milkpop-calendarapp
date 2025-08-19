// 予定登録
app.post("/api/share/:linkId", async (req, res) => {
  const { linkId } = req.params;
  const { username, date, timeslot, comment, token } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO schedules (username, date, timeslot, comment, linkid, token)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [username, date, timeslot, comment, linkId, token]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Failed to insert schedule:", err);
    res.status(500).json({ error: "Failed to insert schedule" });
  }
});

// 予定削除
app.delete("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  try {
    const result = await pool.query(
      "DELETE FROM schedules WHERE id=$1 AND token=$2 RETURNING *",
      [id, token]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: "権限がありません" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete schedule:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});

// 予定編集
app.put("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  const { username, date, timeslot, comment, token } = req.body;

  try {
    const result = await pool.query(
      "UPDATE schedules SET username=$1, date=$2, timeslot=$3, comment=$4 WHERE id=$5 AND token=$6 RETURNING *",
      [username, date, timeslot, comment, id, token]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: "権限がありません" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Failed to update schedule:", err);
    res.status(500).json({ error: "Failed to update schedule" });
  }
});
