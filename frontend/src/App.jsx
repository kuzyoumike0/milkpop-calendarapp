import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-[#1a1a1a] flex flex-col">
      {/* 固定ナビバー */}
      <header className="bg-black/50 backdrop-blur-md border-b border-white/10 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* ロゴ */}
          <h1 className="text-2xl font-bold text-white tracking-wide drop-shadow-lg">
            MilkPOP Calendar
          </h1>

          {/* PCメニュー */}
          <nav className="hidden md:flex space-x-6">
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

          {/* ハンバーガー（スマホ用） */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {/* 三本線アイコン */}
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* モバイルメニュー */}
        {menuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-md border-t border-white/10 px-6 py-4 space-y-4">
            <Link
              to="/"
              className="block text-gray-200 hover:text-[#FDB9C8] transition"
              onClick={() => setMenuOpen(false)}
            >
              トップ
            </Link>
            <Link
              to="/link"
              className="block text-gray-200 hover:text-[#FDB9C8] transition"
              onClick={() => setMenuOpen(false)}
            >
              日程登録
            </Link>
            <Link
              to="/personal"
              className="block text-gray-200 hover:text-[#FDB9C8] transition"
              onClick={() => setMenuOpen(false)}
            >
              個人スケジュール
            </Link>
          </div>
        )}
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
