import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import LinkPage from "./components/LinkPage";

export default function App() {
  return (
    <Router>
      <header className="bg-black text-white p-4 flex justify-between">
        <h1 className="text-2xl font-bold text-[#FDB9C8]">MilkPOP Calendar</h1>
        <nav className="flex space-x-4">
          <Link to="/">トップ</Link>
          <Link to="/personal">個人スケジュール</Link>
          <Link to="/share">日程登録</Link>
        </nav>
      </header>
      <main className="p-4 bg-[#fefefe] min-h-screen">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/share" element={<SharePage />} />
          <Route path="/share/:linkid" element={<ShareLinkPage />} />
          <Route path="/link" element={<LinkPage />} />
        </Routes>
      </main>
    </Router>
  );
}
