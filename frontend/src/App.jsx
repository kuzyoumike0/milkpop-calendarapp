import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TopPage from "./components/TopPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import PersonalPage from "./components/PersonalPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* トップページ */}
        <Route path="/" element={<TopPage />} />

        {/* 共有リンク作成ページ */}
        <Route path="/share" element={<SharePage />} />

        {/* 個人ページ（必要なら） */}
        <Route path="/personal" element={<PersonalPage />} />

        {/* 共有リンク先ページ */}
        <Route path="/link/:linkId" element={<ShareLinkPage />} />
      </Routes>
    </Router>
  );
}
