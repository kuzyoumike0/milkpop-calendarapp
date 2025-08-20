import React from "react";
import { Link } from "react-router-dom";

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FDB9C8] via-white to-[#004CA0]">
      {/* ヘッダー */}
      <header className="bg-black text-white py-4 px-6 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">MilkPOP Calendar</h1>
        <nav className="space-x-6 text-sm sm:text-base">
          <Link to="/" className="hover:text-[#FDB9C8] transition">
            トップ
          </Link>
          <Link to="/link" className="hover:text-[#FDB9C8] transition">
            日程登録
          </Link>
          <Link to="/personal" className="hover:text-[#FDB9C8] transition">
            個人スケジュール
          </Link>
        </nav>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 p-6">{children}</main>

      {/* フッター（任意） */}
      <footer className="bg-black text-gray-400 text-xs text-center py-3">
        © 2025 MilkPOP Calendar
      </footer>
    </div>
  );
}
