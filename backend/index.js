import express from "express";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// 共有リンク発行
app.post("/api/share", async (req, res) => {
  try {
    const shareId = uuidv4();
    const { description } = req.body;

    await pool.query(
      "INSERT INTO share_links (share_id, description) VALUES ($1, $2)",
      [shareId, description || null]
    );

    res.json({ success: true, shareUrl: `/share/${shareId}` });
  } catch (err) {
    console.error("Error creating share link:", err);
    res.status(500).json({ success: false, error: "Failed to create share link" });
  }
});

// 共有リンク先データ取得
app.get("/api/share/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const result = await pool.query(
      "SELECT * FROM share_links WHERE share_id = $1",
      [shareId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Link not found" });
    }

    res.json({ success: true, link: result.rows[0] });
  } catch (err) {
    console.error("Error fetching share link:", err);
    res.status(500).json({ success: false, error: "Failed to fetch share link" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
