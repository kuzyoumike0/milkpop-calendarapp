// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-black text-white">
        {/* ===== バナー（共通ヘッダー） ===== */}
        <header className="bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] p-4 shadow-lg flex justify-between items-center">
          <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
          <nav className="flex gap-4">
            <Link
              to="/"
              className="hover:underline text-white font-medium"
            >
              トップ
            </Link>
            <Link
              to="/register"
              className="hover:underline text-white font-medium"
            >
              日程登録
            </Link>
            <Link
              to="/personal"
              className="hover:underline text-white font-medium"
            >
              個人スケジュール
            </Link>
          </nav>
        </header>

        {/* ===== ページ表示部分 ===== */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/share/:id" element={<SharePage />} />
          </Routes>
        </main>

        {/* ===== フッター ===== */}
        <footer className="bg-gray-900 text-center py-4 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} MilkPOP Calendar
        </footer>
      </div>
    </Router>
  );
};

export default App;
