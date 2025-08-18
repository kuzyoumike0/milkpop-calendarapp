import express from "express";
import bodyParser from "body-parser";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// 共有リンクを発行
app.post("/api/share-link", async (req, res) => {
  try {
    const shareId = uuidv4();

    await pool.query(
      `INSERT INTO shares (share_id, created_at, title) VALUES ($1, NOW(), $2)`,
      [shareId, "新しい共有リンク"]
    );

    res.json({ url: `/share/${shareId}` });
  } catch (err) {
    console.error("Error creating share link:", err);
    res.status(500).json({ error: "共有リンク作成に失敗しました" });
  }
});

// 共有ページから予定を登録
app.post("/api/share/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const { username, dates } = req.body;

    for (const d of dates) {
      await pool.query(
        `INSERT INTO share_events (share_id, username, event_date) VALUES ($1, $2, $3)`,
        [shareId, username, d]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error saving events:", err);
    res.status(500).json({ error: "予定の登録に失敗しました" });
  }
});

// 共有ページの予定一覧取得
app.get("/api/share/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const result = await pool.query(
      `SELECT username, event_date FROM share_events WHERE share_id=$1 ORDER BY event_date ASC`,
      [shareId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching share events:", err);
    res.status(500).json({ error: "予定取得に失敗しました" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
