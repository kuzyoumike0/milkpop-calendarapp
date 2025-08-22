const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let schedulesDB = {}; // 簡易DB（実際はPostgresなどを使う）

// ===== 登録 =====
app.post("/api/schedules", (req, res) => {
  const id = uuidv4();
  schedulesDB[id] = req.body.schedules;
  console.log("📥 保存:", schedulesDB[id]);
  res.json({ ok: true, id });
});

// ===== 取得 =====
app.get("/api/schedules/:id", (req, res) => {
  const { id } = req.params;
  const schedules = schedulesDB[id];
  if (!schedules) {
    return res.status(404).json({ ok: false, message: "Not found" });
  }
  res.json({ ok: true, schedules });
});

// ===== Reactビルド配信 =====
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
