// frontend/src/components/TopPage.jsx
import React from "react";
import "../common.css";
import "../top.css";
import { Link } from "react-router-dom";

const TopPage = () => {
  return (
    <div className="top-page">
      {/* ===== メイン画像 ===== */}
      <div className="hero-image">
        <img src="/logo.png" alt="MilkPOP Calendar" />
      </div>

      {/* ===== ガラス風カード ===== */}
      <div className="glass-card">
        <h2 className="welcome-title">ようこそ、MilkPOP Calendarへ！</h2>
        <p>
          みんなで予定を共有したり、
          個人スケジュールを管理したりできます。<br />
        </p>

        <div className="button-area">
          <Link to="/register" className="glass-button">📅 日程登録へ</Link>
          <Link to="/personal" className="glass-button">📝 個人スケジュールへ</Link>
        </div>
      </div>
    </div>
  );
};

export default TopPage;
