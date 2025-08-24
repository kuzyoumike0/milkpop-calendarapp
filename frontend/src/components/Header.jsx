import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      {/* 左側ロゴ */}
      <Link to="/" className="logo-link">
        MilkPOP Calendar
      </Link>

      {/* PC用ナビゲーション */}
      <nav className="nav-links">
        <Link to="/personal">個人スケジュール</Link>
        <Link to="/register">日程登録</Link>
        <a href="/auth/discord" className="discord-login">
          Discordログイン
        </a>
      </nav>

      {/* ハンバーガーメニュー（スマホ用） */}
      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* モバイルメニュー */}
      <div className={`nav-links-mobile ${menuOpen ? "open" : ""}`}>
        <Link to="/personal" onClick={() => setMenuOpen(false)}>
          個人スケジュール
        </Link>
        <Link to="/register" onClick={() => setMenuOpen(false)}>
          日程登録
        </Link>
        <a
          href="/auth/discord"
          className="discord-login"
          onClick={() => setMenuOpen(false)}
        >
          Discordログイン
        </a>
      </div>
    </header>
  );
}
