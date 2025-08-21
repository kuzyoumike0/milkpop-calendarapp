const express = require("express");
const path = require("path");
const app = express();

// APIルートの後に静的ファイル配信を設定
app.use(express.static(path.join(__dirname, "public")));

// Reactのルート解決
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
