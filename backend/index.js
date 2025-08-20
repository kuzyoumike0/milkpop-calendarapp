const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// === DB接続設定 ===
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "calendar",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      }
);

// === DB初期化 ===
async function initDB() {
  const initSQL = path.join(__dirname, "init.sql");
  const fs = require("fs");
  const sql = fs.readFileSync(initSQL).toString();
  await pool.query(sql);
}
initDB();

// === Google日本の祝日取得 API ===
app.get("/api/holidays", async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const url = `https://www.googleapis.com/calendar/v3/calendars/japanese__ja@holiday.calendar.google.com/events?key=${process.env.GOOGLE_API_KEY}&timeMin=${year}-01-01T00:00:00Z&timeMax=${year}-12-31T23:59:59Z`;
    const response = await fetch(url);
    const data = await
