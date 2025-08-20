import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // メニューリンクをまとめる
  const menuItems = [
    { to: "/", label: "トップ" },
    { to: "/link", label: "日程登録" },
    { to: "/personal", label: "個人スケジュール" },
  ];

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
          <nav className="hidden md:flex space-x-4">
            {menuItems.map((item, i) => (
              <Link
                key={i}
                to={item.to}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#FDB9C8]/30 text-gray-200 font-medium shadow-md border border-white/10 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ハンバーガー（スマホ用） */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
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

        {/* モバイルメニュー (アニメーション付き) */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="md:hidden bg-black/80 backdrop-blur-md border-t border-white/10 px-6 py-6 space-y-4"
            >
              {menuItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={item.to}
                    className="block w-full text-center px-4 py-3 rounded-2xl bg-gradient-to-r from-[#004CA0]/40 to-[#FDB9C8]/40 text-white font-semibold shadow-lg border border-white/10 hover:scale-105 hover:from-[#004CA0]/60 hover:to-[#FDB9C8]/60 transition transform"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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
