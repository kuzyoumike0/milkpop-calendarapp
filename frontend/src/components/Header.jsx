// frontend/src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-black text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* ロゴタイトル */}
        <Link to="/" className="text-2xl font-bold text-[#FDB9C8]">
          MilkPOP Calendar
        </Link>

        {/* ナビゲーション */}
        <nav className="flex space-x-4 items-center">
          <Link
            to="/register"
            className="px-4 py-2 bg-[#FDB9C8] text-black font-semibold rounded-xl shadow-md hover:bg-pink-400 hover:scale-105 transition"
          >
            日程登録
          </Link>
          <Link
            to="/personal"
            className="px-4 py-2 bg-[#004CA0] text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 hover:scale-105 transition"
          >
            個人スケジュール
          </Link>
          <Link
            to="/links"
            className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-xl shadow-md hover:bg-gray-600 hover:scale-105 transition"
          >
            共有リンク
          </Link>
          {/* Discordログイン */}
          <a
            href="https://discord.com/api/oauth2/authorize?client_id=123456789012345678&redirect_uri=https%3A%2F%2Fmilkpop-calendar.up.railway.app%2Fcallback&response_type=code&scope=identify"
            className="px-5 py-2 bg-[#5865F2] text-white font-semibold rounded-full shadow-md hover:bg-[#4752C4] hover:scale-105 transition"
          >
            Discordログイン
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
