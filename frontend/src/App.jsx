import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import SharePage from "./SharePage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 通常カレンダー */}
        <Route path="/" element={<MainPage />} />

        {/* 共有リンク用ページ */}
        <Route path="/share/:id" element={<SharePage />} />
      </Routes>
    </Router>
  );
}
