const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// API
app.get("/api/schedules", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY date ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

app.post("/api/schedules", async (req, res) => {
  const { title, date, timeslot } = req.body;
  if (!title || !date) return res.status(400).send("Missing data");

  try {
    const result = await pool.query(
      "INSERT INTO schedules (title, date, timeslot) VALUES ($1, $2, $3) RETURNING *",
      [title, date, timeslot || "全日"]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB insert error");
  }
});

// Static React
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});