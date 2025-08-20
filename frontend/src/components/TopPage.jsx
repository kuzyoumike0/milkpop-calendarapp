import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* バナー */}
      <header className="w-full bg-black/40 backdrop-blur-md shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-white drop-shadow">
          MilkPOP Calendar
        </h1>
        <nav className="flex gap-4">
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
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-bold text-white drop-shadow mb-10">
          ようこそ 👋
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* 個人用 */}
          <Link
            to="/personal"
            className="px-10 py-6 rounded-2xl font-bold shadow-2xl backdrop-blur-lg 
              bg-white/20 border border-white/30 text-black hover:bg-[#FDB9C8]/70 
              hover:text-black transition text-lg"
          >
            📝 個人スケジュール
          </Link>

          {/* 共有用 */}
          <Link
            to="/link"
            className="px-10 py-6 rounded-2xl font-bold shadow-2xl backdrop-blur-lg 
              bg-white/20 border border-white/30 text-black hover:bg-[#004CA0]/70 
              hover:text-white transition text-lg"
          >
            🤝 共有スケジュール
          </Link>
        </div>
      </main>
    </div>
  );
}
