// frontend/src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-black text-white shadow-md">
      <div className="nav-container flex justify-between items-center py-4 px-8">
        {/* 左側ロゴ */}
        <Link to="/" className="logo text-2xl font-bold text-[#FDB9C8]">
          MilkPOP Calendar
        </Link>

        {/* 右側リンクボタン群 */}
        <nav className="flex space-x-4">
          <Link
            to="/register"
            className="px-4 py-2 rounded-full bg-[#FDB9C8] text-black font-semibold shadow-md hover:bg-pink-400 hover:scale-105 transition"
          >
            日程登録
          </Link>
          <Link
            to="/personal"
            className="px-4 py-2 rounded-full bg-[#004CA0] text-white font-semibold shadow-md hover:bg-blue-700 hover:scale-105 transition"
          >
            個人スケジュール
          </Link>
          <Link
            to="/links"
            className="px-4 py-2 rounded-full bg-gray-700 text-white font-semibold shadow-md hover:bg-gray-500 hover:scale-105 transition"
          >
            共有リンク
          </Link>
          <a
            href="https://discord.com/api/oauth2/authorize?client_id=123456789012345678&redirect_uri=https%3A%2F%2Fmilkpop-calendar.up.railway.app%2Fcallback&response_type=code&scope=identify"
            className="px-5 py-2 rounded-full bg-[#5865F2] text-white font-semibold shadow-md hover:bg-[#4752C4] hover:scale-105 transition"
          >
            Discordログイン
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
