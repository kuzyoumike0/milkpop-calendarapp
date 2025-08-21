// frontend/src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const Header = () => {
  return (
    <header className="banner">
      <h1>
        <Link to="/" className="logo-link">
          MilkPOP Calendar
        </Link>
      </h1>
      <nav>
        <Link to="/share">日程登録</Link>
        <Link to="/personal">個人スケジュール</Link>
      </nav>
    </header>
  );
};

export default Header;
