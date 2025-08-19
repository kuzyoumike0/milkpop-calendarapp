import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ページコンポーネント
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import LinkPage from "./components/LinkPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* トップページ */}
        <Route path="/" element={<TopPage />} />

        {/* 個人スケジュール入力ページ */}
        <Route path="/personal" element={<PersonalPage />} />

        {/* 共有リンク発行ページ */}
        <Route path="/share" element={<SharePage />} />

        {/* 共有リンクページ（発行したリンク先） */}
        <Route path="/links/:linkId" element={<ShareLinkPage />} />

        {/* 汎用リンクページ（旧仕様対応など） */}
        <Route path="/link" element={<LinkPage />} />

        {/* 存在しないURL → トップに戻す */}
        <Route path="*" element={<TopPage />} />
      </Routes>
    </Router>
  );
}
