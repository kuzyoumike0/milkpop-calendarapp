import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 最初に表示するトップページ */}
        <Route path="/" element={<TopPage />} />

        {/* 日程登録ページ */}
        <Route path="/link" element={<LinkPage />} />

        {/* 個人日程登録ページ */}
        <Route path="/personal" element={<PersonalPage />} />

        {/* 共有ページ（一覧） */}
        <Route path="/share" element={<ShareLinkPage />} />

        {/* 共有リンクの個別ページ */}
        <Route path="/share/:linkid" element={<SharePage />} />
      </Routes>
    </Router>
  );
}
