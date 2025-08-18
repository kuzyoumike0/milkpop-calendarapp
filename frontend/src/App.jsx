import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import LinkPage from "./components/LinkPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 起動時はトップページを表示 */}
        <Route path="/" element={<TopPage />} />

        {/* 各ページのルーティング */}
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/sharelink/:id" element={<ShareLinkPage />} />
        <Route path="/link" element={<LinkPage />} />
      </Routes>
    </Router>
  );
}
