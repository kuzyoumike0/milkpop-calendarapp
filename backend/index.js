import express from "express";
import cors from "cors";
import { randomBytes } from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

// 簡易保存用（本当はDB推奨）
const sharedData = {};

// POST /api/share
app.post("/api/share", (req, res) => {
  const { schedules } = req.body;
  const id = randomBytes(4).toString("hex"); // ランダムID
  sharedData[id] = { schedules };
  res.json({ id });
});

// GET /api/share/:id
app.get("/api/share/:id", (req, res) => {
  const id = req.params.id;
  if (!sharedData[id]) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(sharedData[id]);
});

app.listen(5000, () => console.log("✅ Backend running on 5000"));
