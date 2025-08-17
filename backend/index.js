const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

// === Ensure DB schema on boot ===
async function ensureSchema() {
  // calendars
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calendars (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#60a5fa'
    );
  `);
  // schedules
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      timeslot TEXT NOT NULL,
      start_time TIME,
      end_time TIME
    );
  `);
  await pool.query(`
    ALTER TABLE schedules
    ADD COLUMN IF NOT EXISTS calendar_id INTEGER REFERENCES calendars(id) ON DELETE SET NULL;
  ALTER TABLE schedules
    ADD COLUMN IF NOT EXISTS start_time TIME;
  ALTER TABLE schedules
    ADD COLUMN IF NOT EXISTS end_time TIME;
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_schedules_calendar_id ON schedules(calendar_id);`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shares (
      id SERIAL PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      calendar_ids INTEGER[] NOT NULL,
      items JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`
    INSERT INTO calendars (name, color)
    VALUES ('デフォルト', '#60a5fa')
    ON CONFLICT DO NOTHING;
  `);
  await pool.query(`UPDATE schedules SET calendar_id = 1 WHERE calendar_id IS NULL;`);
}
ensureSchema().then(
  () => console.log('DB schema ensured'),
  (e) => { console.error('Schema init failed:', e); process.exit(1); }
);


// ---- Calendars ----
app.get("/api/calendars", async (req, res) => {
  try {
    const q = await pool.query("SELECT * FROM calendars ORDER BY id ASC");
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send("DB calendars error");
  }
});

app.post("/api/calendars", async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).send("Missing name");
  const c = color || "#60a5fa";
  try {
    const q = await pool.query(
      "INSERT INTO calendars (name, color) VALUES ($1, $2) RETURNING *",
      [name, c]
    );
    res.json(q.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send("DB insert calendar error");
  }
});

// ---- Schedules ----
app.get("/api/schedules", async (req, res) => {
  try {
    const { calendarIds } = req.query; // comma-separated ids
    let rows;
    if (calendarIds) {
      const ids = calendarIds.split(",").map((x) => parseInt(x, 10)).filter(Boolean);
      if (ids.length === 0) {
        return res.json([]);
      }
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
      const q = await pool.query(
        `SELECT s.*, c.name as calendar_name, c.color as calendar_color
         FROM schedules s
         LEFT JOIN calendars c ON s.calendar_id = c.id
         WHERE s.calendar_id IN (${placeholders})
         ORDER BY s.date ASC`,
        ids
      );
      rows = q.rows;
    } else {
      const q = await pool.query(
        `SELECT s.*, c.name as calendar_name, c.color as calendar_color
         FROM schedules s
         LEFT JOIN calendars c ON s.calendar_id = c.id
         ORDER BY s.date ASC`
      );
      rows = q.rows;
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

app.post("/api/schedules", async (req, res) => {
  const { title, date, timeslot, calendar_id } = req.body;
  if (!title || !date) return res.status(400).send("Missing data");

  try {
    const q = await pool.query(
      "INSERT INTO schedules (title, date, timeslot, calendar_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, date, timeslot || "全日", calendar_id || null]
    );
    res.json(q.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB insert error");
  }
});

// Static React

// ---- Bulk insert schedules ----

// ---- Bulk insert schedules (items form) ----
app.post("/api/schedules/bulk", async (req, res) => {
  // Accept either legacy {title, dates[], timeslot, calendar_id} or new {items:[{date,title,mode,timeslot,start_time,end_time,calendar_id}], default_calendar_id}
  try {
    const body = req.body || {};
    let items = [];
    if (Array.isArray(body.items)) {
      items = body.items;
    } else if (Array.isArray(body.dates) && body.title) {
      items = body.dates.map(d => ({
        date: d, title: body.title, timeslot: body.timeslot || "全日", calendar_id: body.calendar_id || null
      }));
    }
    items = items.filter(it => it && it.date && it.title);
    if (items.length === 0) return res.status(400).send("No items");
    const values = [];
    const placeholders = [];
    items.forEach((it, i) => {
      const idx = i * 6;
      placeholders.push(`($${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5}, $${idx+6})`);
      values.push(it.title, it.date, it.timeslot || "全日", it.calendar_id || body.default_calendar_id || null, it.start_time || null, it.end_time || null);
    });
    const sql = `INSERT INTO schedules (title, date, timeslot, calendar_id, start_time, end_time) VALUES ${placeholders.join(",")} RETURNING *`;
    const q = await pool.query(sql, values);
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send("DB bulk insert error");
  }
});




// ---- Share links ----
// Create a new share with selected calendar IDs, returns a URL containing a token
app.post("/api/share", async (req, res) => {
  try {
    const { calendarIds } = req.body;
    const ids = Array.isArray(calendarIds) ? calendarIds.map(x=>parseInt(x,10)).filter(Boolean) : [];
    if (ids.length === 0) return res.status(400).send("Missing calendarIds");
    const token = (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0,32);
    const q = await pool.query(
      "INSERT INTO shares (token, calendar_ids) VALUES ($1, $2) RETURNING token",
      [token, ids]
    );
    const baseUrl = process.env.PUBLIC_BASE_URL || ""; // optional
    const url = baseUrl ? `${baseUrl}/share/${token}` : `/share/${token}`;
    res.json({ token: q.rows[0].token, url });
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to create share");
  }
});

// Resolve a share token and return schedules for those calendars
app.get("/api/share/:token", async (req, res) => {
  try {
    const t = req.params.token;
    const row = await pool.query("SELECT * FROM shares WHERE token=$1", [t]);
    if (row.rows.length === 0) return res.status(404).send("Not found");
    const ids = row.rows[0].calendar_ids;
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
    const q = await pool.query(
      `SELECT s.*, c.name as calendar_name, c.color as calendar_color
       FROM schedules s
       LEFT JOIN calendars c ON s.calendar_id = c.id
       WHERE s.calendar_id IN (${placeholders})
       ORDER BY s.date ASC`, ids
    );
    const cals = await pool.query(
      `SELECT * FROM calendars WHERE id IN (${placeholders})`, ids
    );
    res.json({ calendars: cals.rows, schedules: q.rows, items: row.rows[0].items, created_at: row.rows[0].created_at });
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to resolve share");
  }
});



// Create a share that stores item payload (proposed schedules) without saving to schedules table
app.post("/api/share-items", async (req, res) => {
  try {
    const { items, default_calendar_id } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return res.status(400).send("Missing items");
    // assign calendar_id if missing
    const normalized = items.map(it => ({
      date: it.date, title: it.title,
      timeslot: it.timeslot || '全日',
      start_time: it.start_time || null,
      end_time: it.end_time || null,
      calendar_id: it.calendar_id || default_calendar_id || null
    })).filter(x => x.date && x.title);
    if (normalized.length === 0) return res.status(400).send("No valid items");
    const token = (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0,32);
    const calIds = Array.from(new Set(normalized.map(x => x.calendar_id).filter(Boolean)));
    const q = await pool.query(
      "INSERT INTO shares (token, calendar_ids, items) VALUES ($1, $2, $3) RETURNING token",
      [token, calIds, JSON.stringify(normalized)]
    );
    const baseUrl = process.env.PUBLIC_BASE_URL || "";
    const url = baseUrl ? `${baseUrl}/share/${q.rows[0].token}` : `/share/${q.rows[0].token}`;
    res.json({ token: q.rows[0].token, url });
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to create share items");
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});