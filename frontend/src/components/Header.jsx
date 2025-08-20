import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-black shadow-md p-4 flex justify-between items-center fixed top-0 left-0 z-20">
      {/* 左上 ロゴテキスト */}
      <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide drop-shadow-lg text-white">
        MilkPOP Calendar
      </h1>

      {/* 右上 ナビゲーション */}
      <nav className="space-x-6 text-white font-semibold">
        <Link to="/" className="hover:underline">トップ</Link>
        <Link to="/link" className="hover:underline">日程登録</Link>
        <Link to="/personal" className="hover:underline">個人日程</Link>
      </nav>
    </header>
  );
}
