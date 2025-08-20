import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-black border-b border-gray-700 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        {/* 左：ロゴ */}
        <Link to="/" className="text-2xl font-bold text-[#FDB9C8]">
          MilkPOP Calendar
        </Link>

        {/* 右：ナビ */}
        <nav className="flex gap-6">
          <Link
            to="/personal"
            className="text-gray-300 hover:text-[#FDB9C8] transition"
          >
            個人日程
          </Link>
          <Link
            to="/link"
            className="text-gray-300 hover:text-[#FDB9C8] transition"
          >
            日程登録
          </Link>
          <Link
            to="/share"
            className="text-gray-300 hover:text-[#FDB9C8] transition"
          >
            共有ページ
          </Link>
        </nav>
      </div>
    </header>
  );
}
