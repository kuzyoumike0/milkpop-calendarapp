import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-[#1a1a1a] flex flex-col">
      {/* バナー */}
      <header className="bg-black/50 backdrop-blur-md border-b border-white/10 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-wide drop-shadow-lg">
            MilkPOP Calendar
          </h1>
          <nav className="space-x-6">
            <Link to="/" className="text-gray-200 hover:text-[#FDB9C8] transition">
              トップ
            </Link>
            <Link to="/link" className="text-gray-200 hover:text-[#FDB9C8] transition">
              日程登録
            </Link>
            <Link to="/personal" className="text-gray-200 hover:text-[#FDB9C8] transition">
              個人スケジュール
            </Link>
          </nav>
        </div>
      </header>

      {/* ページ内容 */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><TopPage /></Layout>} />
        <Route path="/link" element={<Layout><LinkPage /></Layout>} />
        <Route path="/personal" element={<Layout><PersonalPage /></Layout>} />
      </Routes>
    </Router>
  );
}
