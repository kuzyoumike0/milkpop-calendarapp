const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

let events = [];
let sharedLinks = {};

app.get("/api/share", (req, res) => {
  res.json(events);
});

app.post("/api/personal", (req, res) => {
  const event = { id: uuidv4(), ...req.body };
  events.push(event);
  res.json({ success: true, event });
});

app.post("/api/share/link", (req, res) => {
  const id = uuidv4();
  sharedLinks[id] = [...events];
  res.json({ id });
});

app.get("/api/share/:id", (req, res) => {
  res.json(sharedLinks[req.params.id] || []);
});

const PORT = 8080;
app.listen(PORT, () => console.log(`✅ Backend running on ${PORT}`));
