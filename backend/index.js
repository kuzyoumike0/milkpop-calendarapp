const { v4: uuidv4 } = require("uuid");

// POST 登録
app.post("/api/schedules", async (req, res) => {
  const { title, dates, timeType } = req.body;
  const id = uuidv4();

  try {
    await pool.query(
      "INSERT INTO schedules (id, title, dates, timetype) VALUES ($1, $2, $3, $4)",
      [id, title, JSON.stringify(dates), timeType]
    );
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB登録エラー");
  }
});

// GET 参照
app.get("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM schedules WHERE id=$1", [
      id,
    ]);
    if (result.rows.length === 0) return res.status(404).send("Not Found");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB取得エラー");
  }
});
