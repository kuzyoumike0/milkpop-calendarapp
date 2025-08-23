// frontend/src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="app-header">
      <div className="nav-container">
        {/* 左側ロゴ */}
        <Link to="/" className="logo">
          MilkPOP Calendar
        </Link>

        {/* 右側リンクボタン群 */}
        <nav className="nav-links">
          <Link to="/register">日程登録</Link>
          <Link to="/personal">個人スケジュール</Link>
          <Link to="/links">共有リンク</Link>
          <a
            href="https://discord.com/api/oauth2/authorize?client_id=123456789012345678&redirect_uri=https%3A%2F%2Fmilkpop-calendar.up.railway.app%2Fcallback&response_type=code&scope=identify"
            className="discord-btn"
          >
            Discordログイン
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
