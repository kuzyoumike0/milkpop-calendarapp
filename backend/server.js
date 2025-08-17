const express = require("express");
const path = require("path");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// static
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
app.get("*", (_, res) => res.sendFile(path.join(publicDir, "index.html")));

app.listen(PORT, () => console.log("✅ Backend on " + PORT));
