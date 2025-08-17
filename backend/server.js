import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// minimal table
async function initDB(){
  await pool.query(`CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    title TEXT,
    username TEXT,
    memo TEXT,
    date DATE,
    time_slot TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
}
initDB();

app.post("/api/schedules", async (req,res)=>{
  const { title, username, memo, date, time_slot } = req.body || {};
  const r = await pool.query(
    "INSERT INTO schedules (title,username,memo,date,time_slot) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [title||null, username||null, memo||null, date||null, time_slot||null]
  );
  res.json(r.rows[0]);
});

app.get("/api/schedules", async (req,res)=>{
  const r = await pool.query("SELECT * FROM schedules ORDER BY date ASC NULLS LAST, id DESC");
  res.json(r.rows);
});

// serve frontend
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req,res)=>{
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>console.log("✅ Backend running on "+PORT));
