const path = require("path");

// 静的ファイル配信
const frontendPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

// React Router のための catch-all
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
