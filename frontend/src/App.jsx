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
      <header className="bg-black text-white p-4 flex justify-between">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:text-pink-300">トップ</Link>
          <Link to="/link" className="hover:text-pink-300">日程登録</Link>
          <Link to="/personal" className="hover:text-pink-300">個人スケジュール</Link>
        </nav>
      </header>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/link" element={<LinkPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/share/:linkid" element={<SharePage />} />
          <Route path="/sharelink" element={<ShareLinkPage />} />
        </Routes>
      </main>
    </Router>
  );
}
