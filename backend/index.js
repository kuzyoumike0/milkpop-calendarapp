const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// React の build を提供
app.use(express.static(path.join(__dirname, "public")));

// サンプル API
app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// React ルーティング対応
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
