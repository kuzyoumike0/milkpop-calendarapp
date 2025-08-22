import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const Header = () => {
  return (
    <>
      <header className="banner">
        <h1>MilkPOP Calendar</h1>
        <nav>
          <Link to="/">トップ</Link>
          <Link to="/share">日程登録</Link>
          <Link to="/personal">個人スケジュール</Link>
        </nav>
      </header>
      {/* ヘッダー下に画像 */}
      <div className="header-image">
        <img src="/header-bg.png" alt="Header Background" />
      </div>
    </>
  );
};

export default Header;
