import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      {/* 左上ロゴ（トップページリンク付きボタン風） */}
      <div className="logo">
        <Link to="/" className="logo-link">
          MilkPOP Calendar
        </Link>
      </div>

      {/* PC用ナビ（トップは削除済み） */}
      <nav className="nav-links">
        <Link to="/personal">個人スケジュール</Link>
        <Link to="/register">日程登録</Link>
        <a href="/auth/discord" className="discord-login">Discordログイン</a>
      </nav>

      {/* ハンバーガーメニュー（スマホ用） */}
      <button
        className="hamburger"
        aria-label="メニューを開く"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* ドロップダウンメニュー（スマホ表示時のみ） */}
      {isOpen && (
        <div className="dropdown">
          <Link to="/personal" onClick={() => setIsOpen(false)}>個人スケジュール</Link>
          <Link to="/register" onClick={() => setIsOpen(false)}>日程登録</Link>
          <a href="/auth/discord" className="discord-login" onClick={() => setIsOpen(false)}>
            Discordログイン
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
