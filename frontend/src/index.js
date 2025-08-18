// ==== 必要モジュール ====
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

// ==== 環境変数 ====
const PORT = Number(process.env.PORT || 8080);

// Docker Compose でも単体実行でも動くように柔軟に設定
// 1) DATABASE_URL があれば最優先（例: postgres://user:pass@host:5432/dbname）
// 2) なければ個別項目で接続（DB_HOST が無ければ localhost を既定）
const DATABASE_URL = process.env.DATABASE_URL || null;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "password";
const DB_NAME = process.env.DB_NAME || "calendar";
const DB_PORT = Number(process.env.DB_PORT || 5432);

// ==== アプリ/サーバ/ソケット ====
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ==== ミドルウェア ====
app.use(cors());
app.use(express.json());

// ==== DB プール作成（DNS 未解決・起動順の問題に耐えるためリトライ）====
function createPool() {
  if (DATABASE_URL) {
    return new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return new Pool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

let pool = createPool();

// DB 接続を待つ（DNS 解決失敗/DB 未起動でも絶対に落ちない）
async function waitForDb({
  tries = 30,          // 試行回数（約 30 回）
  intervalMs = 2000,   // 間隔 2 秒
} = {}) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await pool.query("SELECT 1");
      if (r && r.rows) {
        console.log(`✅ DB 接続OK (${i}回目)`);
        return;
      }
    } catch (e) {
      const hostShown = DATABASE_URL ? new URL(DATABASE_URL).hostname : DB_HOST;
      console.log(`⏳ DB 待機中 (${i}/${tries}) host=${hostShown}… (${e.code || e.message})`);
      // ENOTFOUND などでプールが壊れている可能性に備え再生成
      if (e.code === "ENOTFOUND" || e.code === "EAI_AGAIN" || e.message?.includes("getaddrinfo")) {
        try { await pool.end().catch(() => {}); } catch {}
        pool = createPool();
      }
      await new Promise(r => setTimeout(r, intervalMs));
    }
  }
  // ここまで来ても失敗なら、API はメモリモードで動かせるようにフォールバックして継続
  console.warn("⚠️ DB に接続できません。フォールバック（メモリ保存）で継続します。");
  pool = null;
}

// ==== スキーマ（起動時に自動作成。DB無し時はスキップ）====
async function ensureSchema() {
  if (!pool) return; // メモリモード
  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_links (
      share_id     TEXT PRIMARY KEY,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_events (
      id           UUID PRIMARY KEY,
      share_id     TEXT NOT NULL REFERENCES share_links(share_id) ON DELETE CASCADE,
      title        TEXT NOT NULL,
      dates        DATE[] NOT NULL,
      category     TEXT NOT NULL,
      start_time   TIME NOT NULL,
      end_time     TIME NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS share_participants (
      id           UUID PRIMARY KEY,
      share_id     TEXT NOT NULL REFERENCES share_links(share_id) ON DELETE CASCADE,
      event_id     UUID NOT NULL REFERENCES share_events(id) ON DELETE CASCADE,
      username     TEXT NOT NULL,
      category     TEXT,
      start_time   TIME,
      end_time     TIME,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(share_id, event_id, username)
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_share_events_share ON share_events(share_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_share_participants_share ON share_participants(share_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_share_participants_event ON share_participants(event_id);`);
}

// ==== メモリフォールバック（DB 不可時）====
const mem = {
  links: new Set(), // shareId
  events: new Map(), // shareId -> [{...}]
  participants: new Map(), // shareId -> { eventId: [{...}] }
};

function genShareId() { return Math.random().toString(36).slice(2, 10); }
function toPgTime(t) { return t || "00:00"; }

// ==== Socket.IO ====
io.on("connection", (socket) => {
  socket.on("joinShare", (shareId) => socket.join(shareId));
});

// ==== API ====

// 共有リンク作成
app.post("/api/create-share", async (_req, res) => {
  const shareId = genShareId();
  if (!pool) {
    mem.links.add(shareId);
    return res.json({ shareId });
  }
  try {
    await pool.query("INSERT INTO share_links(share_id) VALUES($1) ON CONFLICT DO NOTHING", [shareId]);
    res.json({ shareId });
  } catch {
    mem.links.add(shareId);
    res.json({ shareId });
  }
});

// イベント登録
app.post("/api/:shareId/events", async (req, res) => {
  const { shareId } = req.params;
  const { title, dates, category, startTime, endTime } = req.body;
  if (!Array.isArray(dates) || dates.length === 0 || !title) {
    return res.status(400).json({ error: "title と dates は必須です" });
  }

  const id = uuidv4();
  const payload = {
    id,
    title,
    dates,
    category,
    startTime: toPgTime(startTime),
    endTime: toPgTime(endTime),
  };

  if (!pool) {
    // メモリ保存
    mem.links.add(shareId);
    const list = mem.events.get(shareId) || [];
    list.push(payload);
    mem.events.set(shareId, list);
    io.to(shareId).emit("eventAdded", payload);
    return res.json(payload);
  }

  try {
    await pool.query("INSERT INTO share_links(share_id) VALUES($1) ON CONFLICT DO NOTHING", [shareId]);
    const q = `
      INSERT INTO share_events(id, share_id, title, dates, category, start_time, end_time)
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, title, dates, category, start_time, end_time
    `;
    const r = await pool.query(q, [
      id, shareId, title, dates, category, toPgTime(startTime), toPgTime(endTime),
    ]);
    const ev = r.rows[0];
    const out = {
      id: ev.id,
      title: ev.title,
      dates: ev.dates,
      category: ev.category,
      startTime: ev.start_time,
      endTime: ev.end_time,
    };
    io.to(shareId).emit("eventAdded", out);
    res.json(out);
  } catch (e) {
    console.error(e);
    // 最後の砦：メモリ保存して成功扱い
    mem.links.add(shareId);
    const list = mem.events.get(shareId) || [];
    list.push(payload);
    mem.events.set(shareId, list);
    io.to(shareId).emit("eventAdded", payload);
    res.json(payload);
  }
});

// イベント一覧
app.get("/api/:shareId/events", async (req, res) => {
  const { shareId } = req.params;

  if (!pool) {
    const list = mem.events.get(shareId) || [];
    // dates[0], startTime でソート
    const sorted = [...list].sort((a, b) => {
      const ka = `${a.dates?.[0] || "9999-12-31"} ${a.startTime || "00:00"}`;
      const kb = `${b.dates?.[0] || "9999-12-31"} ${b.startTime || "00:00"}`;
      return ka > kb ? 1 : -1;
    });
    return res.json(sorted);
  }

  try {
    const r = await pool.query(
      `SELECT id, title, dates, category, start_time, end_time
         FROM share_events
        WHERE share_id = $1
        ORDER BY (dates[1]) ASC NULLS LAST, start_time ASC`,
      [shareId]
    );
    const list = r.rows.map(ev => ({
      id: ev.id,
      title: ev.title,
      dates: ev.dates,
      category: ev.category,
      startTime: ev.start_time,
      endTime: ev.end_time,
    }));
    res.json(list);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

// 参加者一覧
app.get("/api/:shareId/participants", async (req, res) => {
  const { shareId } = req.params;

  if (!pool) {
    return res.json(mem.participants.get(shareId) || {});
  }

  try {
    const r = await pool.query(
      `SELECT event_id, username, category, start_time, end_time
         FROM share_participants
        WHERE share_id = $1`,
      [shareId]
    );
    const map = {};
    for (const row of r.rows) {
      map[row.event_id] = map[row.event_id] || [];
      map[row.event_id].push({
        username: row.username,
        category: row.category,
        startTime: row.start_time,
        endTime: row.end_time,
      });
    }
    res.json(map);
  } catch (e) {
    console.error(e);
    res.json({});
  }
});

// 参加登録
app.post("/api/:shareId/join", async (req, res) => {
  const { shareId } = req.params;
  const { username, responses } = req.body || {};
  if (!username || typeof responses !== "object") {
    return res.status(400).json({ error: "username と responses は必須です" });
  }

  if (!pool) {
    const map = mem.participants.get(shareId) || {};
    for (const [eventId, v] of Object.entries(responses)) {
      if (!v) continue;
      map[eventId] = map[eventId] || [];
      // 既存の同ユーザーを排除してから追加
      map[eventId] = map[eventId].filter(p => p.username !== username);
      if (v.join !== false) {
        map[eventId].push({
          username,
          category: v.category || null,
          startTime: v.startTime || null,
          endTime: v.endTime || null,
        });
      }
    }
    mem.participants.set(shareId, map);
    io.to(shareId).emit("participantsUpdated", map);
    return res.json({ ok: true, participants: map });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO share_links(share_id) VALUES($1) ON CONFLICT DO NOTHING", [shareId]);

    for (const [eventId, v] of Object.entries(responses)) {
      if (!v) continue;
      if (v.join === false) {
        await client.query(
          `DELETE FROM share_participants WHERE share_id = $1 AND event_id = $2 AND username = $3`,
          [shareId, eventId, username]
        );
        continue;
      }
      await client.query(
        `INSERT INTO share_participants(id, share_id, event_id, username, category, start_time, end_time)
         VALUES($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(share_id, event_id, username)
         DO UPDATE SET category = EXCLUDED.category, start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time`,
        [
          uuidv4(),
          shareId,
          eventId,
          username,
          v.category || null,
          v.startTime ? toPgTime(v.startTime) : null,
          v.endTime ? toPgTime(v.endTime) : null,
        ]
      );
    }

    await client.query("COMMIT");

    const pr = await pool.query(
      `SELECT event_id, username, category, start_time, end_time
         FROM share_participants
        WHERE share_id = $1`,
      [shareId]
    );
    const map = {};
    for (const row of pr.rows) {
      map[row.event_id] = map[row.event_id] || [];
      map[row.event_id].push({
        username: row.username,
        category: row.category,
        startTime: row.start_time,
        endTime: row.end_time,
      });
    }
    io.to(shareId).emit("participantsUpdated", map);
    res.json({ ok: true, participants: map });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: "failed to save participation" });
  } finally {
    client.release();
  }
});

// ==== React ビルド配信 ====
const frontendPath = path.join(__dirname, "frontend", "build");
app.use(express.static(frontendPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ==== 起動 ====
(async () => {
  try {
    await waitForDb();   // ← ここで DNS/起動を待つ
    await ensureSchema();
    server.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("❌ 起動時エラー:", e);
    // それでもプロセスは落とさず、メモリモードで起動継続
    server.listen(PORT, () => {
      console.log(`⚠️ DB なしのフォールバックで起動: http://localhost:${PORT}`);
    });
  }
})();
