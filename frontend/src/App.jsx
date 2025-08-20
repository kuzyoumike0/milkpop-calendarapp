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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
        <Routes>
          {/* トップページ */}
          <Route path="/" element={<TopPage />} />

          {/* 日程登録（共有リンク発行） */}
          <Route path="/link" element={<LinkPage />} />

          {/* 個人日程登録 */}
          <Route path="/personal" element={<PersonalPage />} />

          {/* 共有ページ（参加者が入力する） */}
          <Route path="/share/:linkId" element={<SharePage />} />

          {/* 共有リンク専用ビュー（カレンダー確認） */}
          <Route path="/sharelink/:linkId" element={<ShareLinkPage />} />
        </Routes>
      </div>
    </Router>
  );
}
