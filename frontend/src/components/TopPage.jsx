import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* バナー */}
      <header className="w-full bg-black/40 backdrop-blur-md shadow-md p-4 flex justify-between items-center fixed top-0 left-0 z-10">
        <h1 className="text-2xl font-extrabold text-white drop-shadow">
          MilkPOP Calendar
        </h1>
        <nav className="flex gap-6">
          <Link
            to="/personal"
            className="text-white hover:text-[#FDB9C8] transition"
          >
            個人スケジュール
          </Link>
          <Link
            to="/link"
            className="text-white hover:text-[#FDB9C8] transition"
          >
            共有スケジュール
          </Link>
        </nav>
      </header>

      {/* メイン */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4 mt-16">
        <h2 className="text-4xl font-bold text-white drop-shadow mb-12">
          ようこそ 👋
        </h2>

        <div className="flex flex-col gap-10 w-full max-w-lg">
          {/* 個人用カード */}
          <Link
            to="/personal"
            className="w-full px-8 py-12 rounded-3xl font-bold text-2xl shadow-2xl
              backdrop-blur-xl bg-white/10 border border-white/20 text-white 
              hover:bg-[#FDB9C8]/40 hover:text-black hover:scale-105 
              transition transform duration-300"
          >
            📝 個人スケジュール
          </Link>

          {/* 共有用カード */}
          <Link
            to="/link"
            className="w-full px-8 py-12 rounded-3xl font-bold text-2xl shadow-2xl
              backdrop-blur-xl bg-white/10 border border-white/20 text-white 
              hover:bg-[#004CA0]/50 hover:text-white hover:scale-105 
              transition transform duration-300"
          >
            🤝 共有スケジュール
          </Link>
        </div>
      </main>
    </div>
  );
}
