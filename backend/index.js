const express = require("express");
const cors = require("cors");
const path = require("path");
const { randomBytes } = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const sharedData = {};

// ===== API =====
app.post("/api/schedules", (req, res) => {
  console.log("POST /api/schedules", req.body);
  res.json({ ok: true, data: req.body });
});

app.put("/api/schedules/:id", (req, res) => {
  console.log("PUT /api/schedules/:id", req.params.id, req.body);
  res.json({ ok: true, id: req.params.id, data: req.body });
});

app.post("/api/share", (req, res) => {
  const { schedules } = req.body;
  const id = randomBytes(4).toString("hex");
  sharedData[id] = { schedules };
  res.json({ id });
});

app.get("/api/share/:id", (req, res) => {
  const id = req.params.id;
  if (!sharedData[id]) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(sharedData[id]);
});

// ===== React のビルド成果物を配信 =====
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ===== ポート設定 =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
