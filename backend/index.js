const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();

// ===== 環境変数 =====
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CALLBACK_URL =
  process.env.CALLBACK_URL || "http://localhost:3000/api/auth/discord/callback";
const SESSION_SECRET = process.env.SESSION_SECRET || "090612300623";
const DATABASE_URL = process.env.DATABASE_URL;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ DISCORD_CLIENT_ID または DISCORD_CLIENT_SECRET が設定されていません");
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL が設定されていません");
  process.exit(1);
}

// ===== DB接続 =====
const pool = new Pool({ connectionString: DATABASE_URL });

// ===== ミドルウェア =====
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ===== Passport設定 =====
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new DiscordStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["identify", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const client = await pool.connect();
        const result = await client.query(
          `INSERT INTO users (discord_id, username, avatar, email)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (discord_id)
           DO UPDATE SET username=$2, avatar=$3, email=$4, updated_at=NOW()
           RETURNING *`,
          [profile.id, profile.username, profile.avatar, profile.email]
        );
        client.release();
        return done(null, result.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ===== 認証ルート =====
app.get(
  "/api/auth/discord",
  passport.authenticate("discord", { scope: ["identify", "email"] })
);

app.get(
  "/api/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login-failed" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

app.get("/api/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

app.get("/api/auth/user", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.json({ user: null });
  }
});

// ===== 個人日程API =====

// 日程登録
app.post("/api/personal-schedules", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "ログインが必要です" });

  const { title, memo, start_date, end_date, is_all_day, time_range, start_time, end_time } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO personal_schedules
       (user_id, title, memo, start_date, end_date, is_all_day, time_range, start_time, end_time)
       VALUES ((SELECT id FROM users WHERE discord_id=$1), $2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [req.user.discord_id, title, memo, start_date, end_date, is_all_day, time_range, start_time, end_time]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 日程取得
app.get("/api/personal-schedules", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "ログインが必要です" });
  try {
    const result = await pool.query(
      `SELECT * FROM personal_schedules
       WHERE user_id=(SELECT id FROM users WHERE discord_id=$1)
       ORDER BY start_date ASC`,
      [req.user.discord_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== 共有リンクAPI =====

// 共有リンク発行
app.post("/api/personal-schedules/share", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "ログインが必要です" });

  const { title } = req.body;
  const uuid = uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO personal_schedule_links (user_id, uuid, title)
       VALUES ((SELECT id FROM users WHERE discord_id=$1), $2, $3)
       RETURNING *`,
      [req.user.discord_id, uuid, title]
    );
    res.json({
      url: `/share/${uuid}`,
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 共有リンクから予定取得
app.get("/api/personal-schedules/share/:uuid", async (req, res) => {
  const { uuid } = req.params;
  try {
    const result = await pool.query(
      `SELECT ps.* FROM personal_schedules ps
       JOIN personal_schedule_links l ON l.user_id = ps.user_id
       WHERE l.uuid=$1
       ORDER BY ps.start_date ASC`,
      [uuid]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// マトリクス形式で投票取得
app.get("/api/personal-schedules/share/:uuid/matrix", async (req, res) => {
  const { uuid } = req.params;
  try {
    const result = await pool.query(
      `SELECT ps.id as schedule_id, ps.title, ps.start_date,
              v.voter_name, v.status
       FROM personal_schedules ps
       JOIN personal_schedule_links l ON l.user_id = ps.user_id
       LEFT JOIN schedule_votes v ON v.schedule_id = ps.id
       WHERE l.uuid=$1
       ORDER BY ps.start_date ASC`,
      [uuid]
    );

    const schedules = [];
    const votersSet = new Set();
    const votes = {};

    result.rows.forEach(row => {
      if (!schedules.find(s => s.id === row.schedule_id)) {
        schedules.push({
          id: row.schedule_id,
          title: row.title,
          start_date: row.start_date
        });
      }
      if (row.voter_name) votersSet.add(row.voter_name);
      if (!votes[row.schedule_id]) votes[row.schedule_id] = {};
      if (row.voter_name) votes[row.schedule_id][row.voter_name] = row.status;
    });

    res.json({
      schedules,
      voters: Array.from(votersSet),
      votes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== 投票API =====
app.post("/api/personal-schedules/:scheduleId/vote", async (req, res) => {
  const { scheduleId } = req.params;
  const { voter_name, status } = req.body;

  if (!["参加", "不参加"].includes(status)) {
    return res.status(400).json({ error: "無効なステータスです" });
  }

  let discordId = null;
  let name = voter_name;
  if (req.user) {
    discordId = req.user.discord_id;
    name = req.user.username;
  }

  try {
    const result = await pool.query(
      `INSERT INTO schedule_votes (schedule_id, voter_name, voter_discord_id, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (schedule_id, COALESCE(voter_discord_id, voter_name))
       DO UPDATE SET status=$4, updated_at=NOW()
       RETURNING *`,
      [scheduleId, name, discordId, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Reactビルド配信 =====
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ===== 起動 =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
