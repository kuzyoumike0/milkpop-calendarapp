// ==== 必要モジュール ====
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

// ==== 環境変数（docker-compose の想定に合わせたデフォルト）====
const PORT = process.env.PORT || 8080;
const DB_HOST = process.env.DB_HOST || "db";
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

// ==== DB プール ====
const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
});

// ==== スキーマ（起動時に自動作成/追従）====
async function ensureSchema() {
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

  // 用心のためインデックス
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_share_events_share ON share_events(share_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_share_participants_share ON share_participants(share_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_share_participants_event ON share_participants(event_id);`);
}

// ==== ユーティリティ ====
function genShareId() {
  // 8桁英数（短縮ID）
  return Math.random().toString(36).slice(2, 10);
}

function toPgTime(t) {
  // "HH:mm" 形式のままで TIME に入れられる
  return t || "00:00";
}

function sortKey(ev) {
  const firstDate = (ev.dates && ev.dates[0]) || ev.date || "9999-12-31";
  const start = ev.start_time || ev.startTime || "00:00";
  return `${firstDate} ${start}`;
}

// ==== Socket.IO ルーム参加 ====
io.on("connection", (socket) => {
  socket.on("joinShare", (shareId) => {
    socket.join(shareId);
  });
});

// ==== API ====

// 共有リンク作成（毎回新規）
app.post("/api/create-share", async (_req, res) => {
  try {
    let shareId = genShareId();
    // 衝突時は生成し直し（理論上レア）
    for (let i = 0; i < 3; i++) {
      const r = await pool.query("SELECT 1 FROM share_links WHERE share_id = $1", [shareId]);
      if (r.rowCount === 0) break;
      shareId = genShareId();
    }
    await pool.query("INSERT INTO share_links(share_id) VALUES($1)", [shareId]);
    res.json({ shareId });
  } catch (e) {
    console.error(e);
    // 失敗時もフロントが止まらないようにフォールバック
    const shareId = genShareId();
    try {
      await pool.query("INSERT INTO share_links(share_id) VALUES($1) ON CONFLICT DO NOTHING", [shareId]);
    } catch {}
    res.json({ shareId });
  }
});

// イベント新規追加（複数日を 1 レコードの DATE[] として保存）
app.post("/api/:shareId/events", async (req, res) => {
  const { shareId } = req.params;
  const { title, dates, category, startTime, endTime } = req.body;

  if (!Array.isArray(dates) || dates.length === 0 || !title) {
    return res.status(400).json({ error: "title と dates は必須です" });
  }

  try {
    // リンクが無ければ作る（クライアントが勝手にID生成した場合でも耐性）
    await pool.query("INSERT INTO share_links(share_id) VALUES($1) ON CONFLICT DO NOTHING", [shareId]);

    const id = uuidv4();
    const q = `
      INSERT INTO share_events(id, share_id, title, dates, category, start_time, end_time)
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, share_id, title, dates, category, start_time, end_time, created_at
    `;
    const vals = [id, shareId, title, dates, category, toPgTime(startTime), toPgTime(endTime)];
    const r = await pool.query(q, vals);
    const ev = r.rows[0];

    // ルームにブロードキャスト
    io.to(shareId).emit("eventAdded", {
      id: ev.id,
      title: ev.title,
      dates: ev.dates,
      category: ev.category,
      startTime: ev.start_time,
      endTime: ev.end_time,
    });

    res.json({
      id: ev.id,
      title: ev.title,
      dates: ev.dates,
      category: ev.category,
      startTime: ev.start_time,
      endTime: ev.end_time,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "failed to insert event" });
  }
});

// イベント一覧取得（共有リンク先で使用）
app.get("/api/:shareId/events", async (req, res) => {
  const { shareId } = req.params;
  try {
    const r = await pool.query(
      `SELECT id, title, dates, category, start_time, end_time
       FROM share_events
       WHERE share_id = $1
       ORDER BY (dates[1]) ASC NULLS LAST, start_time ASC`,
      [shareId]
    );
    const list = r.rows.map((ev) => ({
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

// イベント編集（タイトル/日付/区分/時間）
app.put("/api/:shareId/events/:eventId", async (req, res) => {
  const { shareId, eventId } = req.params;
  const { title, dates, category, startTime, endTime } = req.body;

  try {
    const r = await pool.query(
      `UPDATE share_events
         SET title = COALESCE($1, title),
             dates = COALESCE($2, dates),
             category = COALESCE($3, category),
             start_time = COALESCE($4, start_time),
             end_time = COALESCE($5, end_time)
       WHERE share_id = $6 AND id = $7
       RETURNING id, title, dates, category, start_time, end_time`,
      [
        title ?? null,
        Array.isArray(dates) ? dates : null,
        category ?? null,
        startTime ? toPgTime(startTime) : null,
        endTime ? toPgTime(endTime) : null,
        shareId,
        eventId,
      ]
    );

    if (r.rowCount === 0) return res.status(404).json({ error: "event not found" });

    const ev = r.rows[0];
    io.to(shareId).emit("eventUpdated", {
      id: ev.id,
      title: ev.title,
      dates: ev.dates,
      category: ev.category,
      startTime: ev.start_time,
      endTime: ev.end_time,
    });

    res.json({
      id: ev.id,
      title: ev.title,
      dates: ev.dates,
      category: ev.category,
      startTime: ev.start_time,
      endTime: ev.end_time,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to update event" });
  }
});

// イベント削除
app.delete("/api/:shareId/events/:eventId", async (req, res) => {
  const { shareId, eventId } = req.params;
  try {
    const r = await pool.query(
      "DELETE FROM share_events WHERE share_id = $1 AND id = $2",
      [shareId, eventId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "event not found" });

    io.to(shareId).emit("eventDeleted", eventId);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to delete event" });
  }
});

// 参加者一覧（イベントIDごと）
app.get("/api/:shareId/participants", async (req, res) => {
  const { shareId } = req.params;
  try {
    const r = await pool.query(
      `SELECT event_id, username, category, start_time, end_time
         FROM share_participants
        WHERE share_id = $1`,
      [shareId]
    );
    // { eventId: [ {username,...}, ... ] } に整形
    const map = {};
    for (const row of r.rows) {
      const evId = row.event_id;
      map[evId] = map[evId] || [];
      map[evId].push({
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

// 参加登録（responses 形式）
/*
  body: {
    username: string,
    responses: {
      [eventId]: { join: boolean, category?: string, startTime?: "HH:mm", endTime?: "HH:mm" }
    }
  }
*/
app.post("/api/:shareId/join", async (req, res) => {
  const { shareId } = req.params;
  const { username, responses } = req.body || {};
  if (!username || typeof responses !== "object") {
    return res.status(400).json({ error: "username と responses は必須です" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 共有リンクが無い可能性に備えて
    await client.query("INSERT INTO share_links(share_id) VALUES($1) ON CONFLICT DO NOTHING", [shareId]);

    for (const [eventId, val] of Object.entries(responses)) {
      if (!val) continue;

      if (val.join === false) {
        // 不参加 → レコード削除（あれば）
        await client.query(
          `DELETE FROM share_participants
            WHERE share_id = $1 AND event_id = $2 AND username = $3`,
          [shareId, eventId, username]
        );
        continue;
      }

      // 参加 → upsert
      const cat = val.category || null;
      const st = val.startTime ? toPgTime(val.startTime) : null;
      const et = val.endTime ? toPgTime(val.endTime) : null;

      await client.query(
        `INSERT INTO share_participants(id, share_id, event_id, username, category, start_time, end_time)
         VALUES($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(share_id, event_id, username)
         DO UPDATE SET category = EXCLUDED.category, start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time`,
        [uuidv4(), shareId, eventId, username, cat, st, et]
      );
    }

    await client.query("COMMIT");

    // 直後の最新を返して、クライアントは即反映できる
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

    // ソケットでブロードキャスト
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

// ==== React ビルド配信（/app/backend/frontend/build 配下を想定）====
const frontendPath = path.join(__dirname, "frontend", "build");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ==== サーバー起動 ====
(async () => {
  try {
    await ensureSchema();
    server.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("❌ 起動時スキーマ初期化に失敗しました:", e);
    process.exit(1);
  }
})();
