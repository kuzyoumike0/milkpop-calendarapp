// frontend/src/components/TopPage.jsx
import React from "react";
import "../common.css";
import "../top.css"; // 専用CSSを作成してもOK

const TopPage = () => {
  return (
    <div className="top-page">
      {/* ===== メイン画像 ===== */}
      <div className="hero-image">
        <img src="/assets/logo.png" alt="MilkPOP Calendar" />
      </div>

      {/* ===== ガラス風カード ===== */}
      <div className="glass-card">
        <h2 className="welcome-title">ようこそ、MilkPOP Calendarへ！</h2>
        <p>
          ここでは、みんなで予定を共有したり、
          個人スケジュールを管理したりできます。<br />
        </p>
      </div>
    </div>
  );
};

export default TopPage;
