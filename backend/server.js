const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:password@db:5432/mydb"
});

// DB初期化
(async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS shared_events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    time_range TEXT,
    username TEXT,
    memo TEXT,
    share_id TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
})();

app.post("/api/shared/create", async (req,res)=>{
  const { title, date, time_range } = req.body;
  const shareId = uuidv4();
  await pool.query("INSERT INTO shared_events (title,event_date,time_range,share_id) VALUES ($1,$2,$3,$4)",
    [title,date,time_range,shareId]);
  res.json({ link: `/shared/${shareId}` });
});

app.get("/api/shared/:shareId", async (req,res)=>{
  const { shareId } = req.params;
  const result = await pool.query("SELECT * FROM shared_events WHERE share_id=$1",[shareId]);
  res.json(result.rows[0]);
});

app.post("/api/shared/:shareId/register", async (req,res)=>{
  const { shareId } = req.params;
  const { username, memo } = req.body;
  await pool.query("UPDATE shared_events SET username=$1,memo=$2 WHERE share_id=$3",
    [username,memo,shareId]);
  res.json({status:"ok"});
});

// フロント配信
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req,res)=>{
  res.sendFile(path.join(__dirname,"public","index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, ()=>console.log("サーバー起動: "+port));
