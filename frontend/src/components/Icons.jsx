// frontend/src/components/Layout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";

function Layout() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* ナビゲーションバー */}
      <header className="bg-gradient-to-r from-[#FDB9C8] via-black to-[#004CA0] p-4 shadow-lg">
        <nav className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="font-bold text-2xl">MilkPOP Calendar</h1>
          <div className="space-x-6">
            <Link to="/" className="hover:text-[#FDB9C8]">トップ</Link>
            <Link to="/link" className="hover:text-[#FDB9C8]">日程登録</Link>
            <Link to="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</Link>
          </div>
        </nav>
      </header>

      {/* コンテンツ */}
      <main className="max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
