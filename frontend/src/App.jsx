import React from "react";
import { Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

export default function App() {
  return (
    <Routes>
      {/* 最初にトップページ */}
      <Route path="/" element={<TopPage />} />
      <Route path="/link" element={<LinkPage />} />
      <Route path="/personal" element={<PersonalPage />} />
      <Route path="/share/:linkid" element={<SharePage />} />
      <Route path="/sharelink" element={<ShareLinkPage />} />
    </Routes>
  );
}
