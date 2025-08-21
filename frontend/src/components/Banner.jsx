import React from "react";
import { Link } from "react-router-dom";

export default function Banner() {
  return (
    <header className="w-full bg-black/70 backdrop-blur-md border-b border-[#FDB9C8]/40 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        {/* ロゴ / タイトル */}
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-transparent bg-clip-text drop-shadow-md">
          MilkPOP Calendar
        </h1>

        {/* ナビゲーション */}
        <nav className="flex gap-8">
          <Link
            to="/"
            className="text-white hover:text-[#FDB9C8] transition font-medium text-lg"
          >
            トップ
          </Link>
          <Link
            to="/personal"
            className="text-white hover:text-[#FDB9C8] transition font-medium text-lg"
          >
            個人スケジュール
          </Link>
          <Link
            to="/link"
            className="text-white hover:text-[#FDB9C8] transition font-medium text-lg"
          >
            共有スケジュール
          </Link>
        </nav>
      </div>
    </header>
  );
}
