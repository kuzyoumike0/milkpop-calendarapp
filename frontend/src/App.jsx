import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        {/* Banner */}
        <header className="bg-[#004CA0] text-white p-4 shadow-lg flex justify-between items-center">
          <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:text-[#FDB9C8]">トップ</Link>
            <Link to="/link" className="hover:text-[#FDB9C8]">日程登録</Link>
            <Link to="/personal" className="hover:text-[#FDB9C8]">個人日程</Link>
          </nav>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/link" element={<LinkPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/share/:linkid" element={<SharePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
