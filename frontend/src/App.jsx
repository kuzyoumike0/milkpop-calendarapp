import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import SharePage from "./components/SharePage";
import PersonalPage from "./components/PersonalPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* トップページ */}
        <Route path="/" element={<TopPage />} />
        {/* 共有カレンダーページ */}
        <Route path="/share" element={<SharePage />} />
        {/* 個人スケジュールページ */}
        <Route path="/personal" element={<PersonalPage />} />
      </Routes>
    </Router>
  );
}
