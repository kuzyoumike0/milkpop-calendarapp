import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import LinkPage from "./components/LinkPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

function App() {
  return (
    <Router>
      <header style={{ background: "#f0f0f0", padding: "10px" }}>
        <h1>MilkPOP Calendar</h1>
        <nav>
          <Link to="/">トップ</Link> |{" "}
          <Link to="/personal">個人スケジュール</Link> |{" "}
          <Link to="/link">日程登録</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/link" element={<LinkPage />} />
        <Route path="/share/:linkid" element={<SharePage />} />
        <Route path="/sharelink" element={<ShareLinkPage />} />
      </Routes>
    </Router>
  );
}

export default App;
