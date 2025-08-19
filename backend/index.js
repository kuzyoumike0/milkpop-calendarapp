app.post("/api/shared", async (req, res) => {
  const { username, mode, dates } = req.body;

  if (!username || !dates || dates.length === 0) {
    return res.status(400).json({ error: "必要な情報が不足しています" });
  }

  try {
    // 既存のユーザー予定を削除してから追加する場合
    await pool.query("DELETE FROM schedules WHERE username = $1", [username]);

    for (const d of dates) {
      await pool.query(
        "INSERT INTO schedules (username, date, mode) VALUES ($1, $2, $3)",
        [username, d, mode]
      );
    }

    res.json({ message: "保存完了" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "保存に失敗しました" });
  }
});
