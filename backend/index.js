const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || "db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "mydb",
        port: 5432,
      }
);

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      linkId TEXT NOT NULL,
      date DATE NOT NULL,
      timeSlot TEXT NOT NULL,
      username TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      linkId TEXT PRIMARY KEY,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS link_modes (
      linkId TEXT PRIMARY KEY,
      mode TEXT NOT NULL DEFAULT 'range'
    );
  `);
}
initDB();

io.on("connection", (socket) => {
  socket.on("join", (linkId) => {
    socket.join(linkId);
  });
});

app.post("/api/create-link", async (req, res) => {
  const linkId = uuidv4();
  await pool.query("INSERT INTO links (linkId) VALUES ($1)", [linkId]);
  await pool.query(
    "INSERT INTO link_modes (linkId, mode) VALUES ($1,$2)",
    [linkId, "range"]
  );
  res.json({ linkId });
});

app.post("/api/schedule", async (req, res) => {
  const { linkId, date, timeSlot, username, status } = req.body;
  await pool.query(
    `INSERT INTO schedules (linkId, date, timeSlot, username, status)
     VALUES ($1, $2, $3, $4, $5)`,
    [linkId, date, timeSlot, username, status]
  );
  const result = await pool.query(
    `SELECT * FROM schedules WHERE linkId=$1 ORDER BY date,timeSlot`,
    [linkId]
  );
  io.to(linkId).emit("updateSchedules", result.rows);
  res.json(result.rows);
});

app.get("/api/schedules/:linkId", async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM schedules WHERE linkId=$1 ORDER BY date,timeSlot`,
    [req.params.linkId]
  );
  res.json(result.rows);
});

app.post("/api/mode", async (req, res) => {
  const { linkId, mode } = req.body;
  await pool.query(
    `INSERT INTO link_modes (linkId, mode)
     VALUES ($1,$2)
     ON CONFLICT (linkId) DO UPDATE SET mode=$2`,
    [linkId, mode]
  );
  io.to(linkId).emit("updateMode", mode);
  res.json({ success: true, mode });
});

app.get("/api/mode/:linkId", async (req, res) => {
  const result = await pool.query(
    "SELECT mode FROM link_modes WHERE linkId=$1",
    [req.params.linkId]
  );
  res.json({ mode: result.rows[0]?.mode || "range" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
