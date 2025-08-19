import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

export default function App() {
  return (
    <Router>
      <div className="bg-black text-white min-h-screen">
        <header className="bg-[#FDB9C8] text-black p-4 flex justify-between">
          <h1 className="font-bold text-xl">MilkPOP Calendar</h1>
          <nav className="space-x-4">
            <Link to="/">トップ</Link>
            <Link to="/link">日程登録</Link>
            <Link to="/personal">個人スケジュール</Link>
          </nav>
        </header>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/link" element={<LinkPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/share/:linkid" element={<SharePage />} />
            <Route path="/sharelink" element={<ShareLinkPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
