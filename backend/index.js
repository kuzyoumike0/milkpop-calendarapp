// backend/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// APIルート
app.get("/api/schedules/share/:id", async (req, res) => {
  const { id } = req.params;
  // DBからデータ取得する想定
  const dummyData = [
    { id: 1, title: "会議", start: "2025-08-21T10:00:00", end: "2025-08-21T11:00:00" },
    { id: 2, title: "ランチ", start: "2025-08-21T12:00:00", end: "2025-08-21T13:00:00" }
  ];
  res.json(dummyData);
});

// ===== Reactビルドファイルの配信設定 =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend/build")));

// React Router用フォールバック
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// ======================================

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
