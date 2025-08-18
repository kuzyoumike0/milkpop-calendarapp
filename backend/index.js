const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/calendar",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      link_id TEXT
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shared_links (
      id SERIAL PRIMARY KEY,
      link_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
})().catch(e => { console.error("DB init failed", e); process.exit(1); });

// List schedules; optional link filter
app.get("/api/schedules", async (req, res) => {
  try {
    const { linkId } = req.query;
    const q = linkId
      ? await pool.query("SELECT * FROM schedules WHERE link_id=$1 ORDER BY start_date", [linkId])
      : await pool.query("SELECT * FROM schedules ORDER BY start_date");
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({error: "fetch error"});
  }
});

// Create schedule
app.post("/api/schedules", async (req, res) => {
  try {
    const { title, memo, start_date, end_date, link_id } = req.body;
    const q = await pool.query(
      "INSERT INTO schedules (title, memo, start_date, end_date, link_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [title, memo || null, start_date, end_date, link_id || null]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({error:"insert error"});
  }
});

// Delete
app.delete("/api/schedules/:id", async (req,res)=>{
  try {
    await pool.query("DELETE FROM schedules WHERE id=$1", [req.params.id]);
    res.json({ok:true});
  } catch(e){
    console.error(e);
    res.status(500).json({error:"delete error"});
  }
});

// Generate shared link
app.post("/api/shared-link", async (req,res)=>{
  try {
    const linkId = uuidv4();
    await pool.query("INSERT INTO shared_links (link_id) VALUES ($1)", [linkId]);
    res.json({ link: `/share/${linkId}`, linkId });
  } catch(e){
    console.error(e);
    res.status(500).json({error:"link error"});
  }
});

// Static frontend
app.use(express.static(path.join(__dirname, "public")));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, ()=> console.log(`✅ Server on ${PORT}`));
