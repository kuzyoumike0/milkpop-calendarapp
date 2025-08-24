// frontend/src/components/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <Link to="/" className="logo-link">
        MilkPOP Calendar
      </Link>

      <nav className="nav-links">
        <Link to="/personal">個人スケジュール</Link>
        <Link to="/register">日程登録</Link>
        <a
          href="https://discord.com/api/oauth2/authorize?client_id=XXXX&permissions=8&scope=bot"
          className="discord-login"
        >
          Discordログイン
        </a>
      </nav>

      {/* ハンバーガーメニュー（スマホ表示用） */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {menuOpen && (
        <div className="dropdown">
          <Link to="/personal" onClick={() => setMenuOpen(false)}>
            個人スケジュール
          </Link>
          <Link to="/register" onClick={() => setMenuOpen(false)}>
            日程登録
          </Link>
          <a
            href="https://discord.com/api/oauth2/authorize?client_id=XXXX&permissions=8&scope=bot"
            onClick={() => setMenuOpen(false)}
          >
            Discordログイン
          </a>
        </div>
      )}
    </header>
  );
}

export default Header;
