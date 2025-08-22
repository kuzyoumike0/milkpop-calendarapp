// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      <div className="logo-wrapper">
        <img src="/logo.png" alt="MilkPOP Logo" className="logo-image" />
      </div>
      <h2 className="welcome-text">ようこそ MilkPOP Calendar へ</h2>
      <p className="welcome-subtext">ポップで可愛いスケジューラー</p>
      <Link to="/register" className="start-btn">
        📅 日程登録ページへ
      </Link>
    </div>
  );
};

export default TopPage;
