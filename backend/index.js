// === 共有リンクの予定＋回答取得API ===
app.get("/api/schedule/:linkid", async (req, res) => {
  const { linkid } = req.params;

  const schedulesRes = await pool.query(
    "SELECT * FROM schedules WHERE linkid = $1",
    [linkid]
  );

  if (schedulesRes.rows.length === 0) {
    return res.status(404).json({ error: "リンクが存在しません" });
  }

  const responsesRes = await pool.query(
    "SELECT username, answers FROM responses WHERE linkid = $1 ORDER BY created_at ASC",
    [linkid]
  );

  res.json({
    schedules: schedulesRes.rows,
    responses: responsesRes.rows,
  });
});

// === 互換用エイリアス ===
app.get("/api/share/:linkid", async (req, res) => {
  res.redirect(`/api/schedule/${req.params.linkid}`);
});

app.post("/api/share/:linkid/response", async (req, res) => {
  const { linkid } = req.params;
  const { username, answers } = req.body;
  if (!username || !answers) {
    return res.status(400).json({ error: "不正なデータです" });
  }
  await pool.query(
    `INSERT INTO responses (linkid, username, answers) VALUES ($1, $2, $3)`,
    [linkid, username, answers]
  );
  res.json({ success: true });
});
