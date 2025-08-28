// frontend/src/components/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../common.css";

export default function Header({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      {/* 左側ロゴ */}
      <Link to="/" className="logo-link">
        MilkPOP Calendar
      </Link>

      {/* PC用ナビゲーション */}
      <nav className="nav-links">
        <Link to="/usage" className="nav-link">
          使い方
        </Link>
        <Link to="/register" className="nav-link">
          日程登録
        </Link>
        {user && (
          <Link to="/personal" className="nav-link">
            個人日程登録
          </Link>
        )}
        {user ? (
          <a href="/auth/logout" className="nav-btn">
            ログアウト
          </a>
        ) : (
          <a href="/auth/discord" className="nav-btn">
            Discordログイン
          </a>
        )}
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
        <Link
          to="/usage"
          className="nav-link-mobile"
          onClick={() => setMenuOpen(false)}
        >
          使い方
        </Link>
        <Link
          to="/register"
          className="nav-link-mobile"
          onClick={() => setMenuOpen(false)}
        >
          日程登録
        </Link>
        {user && (
          <Link
            to="/personal"
            className="nav-link-mobile"
            onClick={() => setMenuOpen(false)}
          >
            個人日程登録
          </Link>
        )}
        {user ? (
          <a
            href="/auth/logout"
            className="nav-btn-mobile"
            onClick={() => setMenuOpen(false)}
          >
            ログアウト
          </a>
        ) : (
          <a
            href="/auth/discord/login"
            className="nav-btn-mobile"
            onClick={() => setMenuOpen(false)}
          >
            Discordログイン
          </a>
        )}
      </div>
    </header>
  );
}
