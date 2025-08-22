// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      <h2 className="welcome-text">ようこそ MilkPOP Calendar へ</h2>

      <div className="top-links">
        <Link to="/register" className="btn">日程登録ページへ</Link> {/* ✅ */}
        <Link to="/personal" className="btn">個人スケジュールページへ</Link>
        <Link to="/share/sample-id" className="btn">共有ページへ</Link>
      </div>
    </div>
  );
};

export default TopPage;
