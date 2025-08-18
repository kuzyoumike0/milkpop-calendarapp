const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// シンプルなAPI
app.get("/api/hello", (req, res) => {
  res.json({ message: "バックエンド動作OK" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
