// frontend/src/components/Layout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      {/* ナビバー */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#FDB9C8] via-black to-[#004CA0] shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3">
          <h1 className="text-2xl font-bold tracking-wide">
            MilkPOP Calendar
          </h1>
          <nav className="space-x-6 text-lg">
            <Link to="/" className="hover:text-[#FDB9C8] transition">トップ</Link>
            <Link to="/link" className="hover:text-[#FDB9C8] transition">日程登録</Link>
            <Link to="/personal" className="hover:text-[#FDB9C8] transition">個人スケジュール</Link>
          </nav>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
