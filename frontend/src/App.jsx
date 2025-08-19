import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import ShareLinkPage from "./components/ShareLinkPage";
import SharePage from "./components/SharePage";

export default function App() {
  return (
    <Router>
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>📅 スケジュール共有アプリ</h1>

        {/* ナビゲーション */}
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "10px" }}>トップページ</Link>
          <Link to="/register" style={{ marginRight: "10px" }}>日程登録ページ</Link>
          <Link to="/personal" style={{ marginRight: "10px" }}>個人日程登録ページ</Link>
          <Link to="/share/sample" style={{ marginRight: "10px" }}>共有ページ(サンプル)</Link>
        </nav>

        {/* ページ遷移 */}
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/register" element={<ShareLinkPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/share/:linkId" element={<SharePage />} />
        </Routes>
      </div>
    </Router>
  );
}
