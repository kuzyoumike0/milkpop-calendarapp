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
        {/* === 共通バナー === */}
        <header className="bg-[#111] border-b border-[#333] p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            {/* ファビコンをバナーにも表示 */}
            <img src="/favicon.ico" alt="logo" className="w-8 h-8" />
            <h1 className="text-2xl font-extrabold tracking-wide text-[#FDB9C8]">
              MilkPOP Calendar
            </h1>
          </div>
          <nav className="space-x-6">
            <Link to="/" className="hover:text-[#FDB9C8] transition">
              トップ
            </Link>
            <Link to="/link" className="hover:text-[#FDB9C8] transition">
              日程登録
            </Link>
            <Link to="/personal" className="hover:text-[#FDB9C8] transition">
              個人日程
            </Link>
          </nav>
        </header>

        {/* === ページコンテンツ === */}
        <main className="p-6">
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
