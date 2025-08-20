import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDB9C8] via-white to-[#004CA0] flex flex-col">
      {/* ヘッダー */}
      <header className="bg-black text-white py-4 px-6 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link to="/link" className="hover:text-[#FDB9C8] transition">日程登録</Link>
          <Link to="/personal" className="hover:text-[#FDB9C8] transition">個人スケジュール</Link>
        </nav>
      </header>

      {/* メイン */}
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg p-10 rounded-2xl shadow-xl max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[#004CA0] mb-6">
            ようこそ ✨
          </h2>
          <p className="text-gray-600 mb-8">
            MilkPOP Calendar で日程をシェアしてみんなで調整しましょう。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              to="/link"
              className="p-6 rounded-xl bg-[#004CA0] text-white font-semibold hover:bg-[#003080] transition shadow-lg"
            >
              📅 日程登録ページ
            </Link>
            <Link
              to="/personal"
              className="p-6 rounded-xl bg-[#FDB9C8] text-black font-semibold hover:bg-[#fda5b8] transition shadow-lg"
            >
              📝 個人スケジュールページ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
