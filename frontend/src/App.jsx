import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

function App() {
  return (
    <Router>
      {/* === バナー共通ヘッダー === */}
      <header
        style={{
          background: "linear-gradient(90deg, #000, #004CA0)",
          padding: "1rem",
          textAlign: "center",
          color: "#FDB9C8",
          fontWeight: "bold",
          fontSize: "1.5rem",
          borderBottom: "2px solid #FDB9C8",
        }}
      >
        <div>MilkPOP Calendar</div>
        <nav style={{ marginTop: "0.5rem" }}>
          <Link to="/" style={navStyle}>
            トップ
          </Link>
          <Link to="/link" style={navStyle}>
            日程登録
          </Link>
          <Link to="/personal" style={navStyle}>
            個人スケジュール
          </Link>
        </nav>
      </header>

      {/* === ページ切替部分 === */}
      <main>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/link" element={<LinkPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/share/:linkId" element={<SharePage />} />
          <Route path="/sharelink" element={<ShareLinkPage />} />
        </Routes>
      </main>
    </Router>
  );
}

const navStyle = {
  margin: "0 1rem",
  color: "#fff",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "1rem",
};

export default App;
