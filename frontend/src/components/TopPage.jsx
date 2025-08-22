// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      {/* タイトル */}
      <h2 className="welcome-text">ようこそ MilkPOP Calendar へ</h2>

      {/* すき間を入れてロゴ表示 */}
      <div className="logo-wrapper">
        <img src="/logo.png" alt="MilkPOP Logo" className="logo-image" />
      </div>

      {/* ページリンク */}
      <div className="top-links">
        <Link to="/register" className="btn">日程登録ページへ</Link>
        <Link to="/personal" className="btn">個人スケジュールページへ</Link>
        <Link to="/share/sample-id" className="btn">共有ページへ</Link>
      </div>
    </div>
  );
};

export default TopPage;
