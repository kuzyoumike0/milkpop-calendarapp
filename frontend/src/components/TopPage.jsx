import React from "react";
import { Link } from "react-router-dom";
import { PencilSquareIcon, UsersIcon } from "@heroicons/react/24/outline";

export default function TopPage() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* バナー */}
      <header className="w-full bg-black/30 backdrop-blur-md shadow-md p-4 flex justify-between items-center fixed top-0 left-0 z-20">
        <h1 className="text-2xl font-extrabold text-white drop-shadow">
          MilkPOP Calendar
        </h1>
        <nav className="flex gap-6">
          <Link
            to="/personal"
            className="text-white hover:text-pink-200 transition"
          >
            個人スケジュール
          </Link>
          <Link
            to="/link"
            className="text-white hover:text-blue-200 transition"
          >
            共有スケジュール
          </Link>
        </nav>
      </header>

      {/* メイン */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4 mt-20 relative z-10">
        <h2 className="text-4xl font-bold text-white drop-shadow mb-12">
          ようこそ 👋
        </h2>

        {/* 背景を暗くするラッパー */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl 
                        bg-black/40 rounded-3xl p-10 backdrop-blur-sm shadow-2xl">
          {/* 個人用カード */}
          <Link
            to="/personal"
            className="group relative w-full px-10 py-14 rounded-2xl font-bold text-2xl
              shadow-xl backdrop-blur-md bg-white/10 border border-white/20 
              text-white hover:bg-pink-400/20 hover:border-pink-200/40 
              hover:scale-105 transition transform duration-500"
          >
            <div className="flex items-center justify-center gap-4">
              <PencilSquareIcon className="w-10 h-10 text-pink-300 group-hover:text-pink-100 transition" />
              <span>個人スケジュール</span>
            </div>
          </Link>

          {/* 共有用カード */}
          <Link
            to="/link"
            className="group relative w-full px-10 py-14 rounded-2xl font-bold text-2xl
              shadow-xl backdrop-blur-md bg-white/10 border border-white/20 
              text-white hover:bg-blue-400/20 hover:border-blue-200/40 
              hover:scale-105 transition transform duration-500"
          >
            <div className="flex items-center justify-center gap-4">
              <UsersIcon className="w-10 h-10 text-blue-300 group-hover:text-blue-100 transition" />
              <span>共有スケジュール</span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
