import React from "react";
import { Link } from "react-router-dom";

export default function Banner() {
  return (
    <header className="w-full backdrop-blur-md bg-black/40 border-b border-white/20 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        {/* ロゴ / タイトル */}
        <h1 className="text-2xl font-bold text-[#FDB9C8] drop-shadow-md">
          MilkPOP Calendar
        </h1>

        {/* ナビゲーション */}
        <nav className="flex gap-6">
          <Link
            to="/"
            className="text-white hover:text-[#FDB9C8] transition font-medium"
          >
            トップ
          </Link>
          <Link
            to="/personal"
            className="text-white hover:text-[#FDB9C8] transition font-medium"
          >
            個人スケジュール
          </Link>
          <Link
            to="/link"
            className="text-white hover:text-[#FDB9C8] transition font-medium"
          >
            共有スケジュール
          </Link>
        </nav>
      </div>
    </header>
  );
}
