import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import Header from "./components/Header";

export default function App() {
  return (
    <Router>
      {/* 共通バナー */}
      <Header />

      {/* ページルーティング */}
      <div className="bg-black min-h-screen text-white">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/link" element={<LinkPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/share/:linkid" element={<SharePage />} />
        </Routes>
      </div>
    </Router>
  );
}
