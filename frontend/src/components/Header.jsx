import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-black shadow-lg p-4 flex justify-between items-center">
      {/* 左上 ロゴテキスト */}
      <div className="flex flex-col items-start">
        <h1 className="text-2xl font-extrabold tracking-wide drop-shadow-lg">
          MilkPOP Calendar
        </h1>
      </div>

      {/* 右上 ナビゲーション */}
      <nav className="space-x-6 text-white font-semibold">
        <Link to="/" className="hover:underline">トップ</Link>
        <Link to="/link" className="hover:underline">日程登録</Link>
        <Link to="/personal" className="hover:underline">個人日程</Link>
      </nav>
    </header>
  );
}
