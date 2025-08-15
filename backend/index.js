const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/api/events", (req, res) => {
  res.json([{ id: 1, title: "Sample Event", date: "2025-08-20" }]);
});

app.listen(5000, () => {
  console.log("Backend is running on port 5000");
});
