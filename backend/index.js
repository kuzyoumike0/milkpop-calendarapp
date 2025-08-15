const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// フロント配信
app.use(express.static(path.join(__dirname, "public")));

// メモリ上に予定保持（サンプル用）
let sharedEvents = [];
let personalEvents = [];

// GET
app.get("/api/shared", (req, res) => {
  const date = req.query.date;
  res.json(sharedEvents.filter(e => e.date === date));
});

app.get("/api/personal/:userId", (req, res) => {
  const date = req.query.date;
  const userId = req.params.userId;
  res.json(personalEvents.filter(e => e.date === date && e.userId === userId));
});

// POST 追加
app.post("/api/shared", (req, res) => {
  const event = { id: Date.now(), ...req.body };
  sharedEvents.push(event);
  res.json(event);
});

app.post("/api/personal", (req, res) => {
  const event = { id: Date.now(), ...req.body };
  personalEvents.push(event);
  res.json(event);
});

// DELETE
app.delete("/api/shared/:id", (req, res) => {
  sharedEvents = sharedEvents.filter(e => e.id !== Number(req.params.id));
  res.json({ success: true });
});

app.delete("/api/personal/:id", (req, res) => {
  personalEvents = personalEvents.filter(e => e.id !== Number(req.params.id));
  res.json({ success: true });
});

// SPA対応
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8
