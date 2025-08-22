// frontend/src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const Header = () => {
  return (
    <header className="header">
      <h1 className="logo">MilkPOP Calendar</h1>
      <nav className="nav-links">
        <Link to="/">トップ</Link>
        <Link to="/register">日程登録</Link>
        <Link to="/personal">個人スケジュール</Link> {/* ✅ 個人スケジュール追加 */}
      </nav>
    </header>
  );
};

export default Header;
