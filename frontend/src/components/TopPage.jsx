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
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl font-bold text-white drop-shadow mb-12">
          ようこそ 👋
        </h2>

        {/* リンクボタンを中央に配置 */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {/* 個人用 */}
          <Link
            to="/personal"
            className="px-12 py-6 rounded-2xl font-bold text-lg shadow-2xl 
              backdrop-blur-lg bg-white/10 border border-white/20 
              text-white hover:bg-[#FDB9C8]/40 hover:scale-105 
              hover:text-black transition transform duration-300"
          >
            📝 個人スケジュール
          </Link>

          {/* 共有用 */}
          <Link
            to="/link"
            className="px-12 py-6 rounded-2xl font-bold text-lg shadow-2xl 
              backdrop-blur-lg bg-white/10 border border-white/20 
              text-white hover:bg-[#004CA0]/50 hover:scale-105 
              hover:text-white transition transform duration-300"
          >
            🤝 共有スケジュール
          </Link>
        </div>
      </main>
    </div>
  );
}
