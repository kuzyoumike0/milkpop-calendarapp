import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      {/* 左側：ロゴ */}
      <div className="logo">
        <Link to="/">MilkPOP Calendar</Link>
      </div>

      {/* PC用ナビ */}
      <nav className="nav-links">
        <Link to="/">トップ</Link>
        <Link to="/personal">個人スケジュール</Link>
        <Link to="/register">日程登録</Link>
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
          <Link to="/" onClick={() => setIsOpen(false)}>トップ</Link>
          <Link to="/personal" onClick={() => setIsOpen(false)}>個人スケジュール</Link>
          <Link to="/register" onClick={() => setIsOpen(false)}>日程登録</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
