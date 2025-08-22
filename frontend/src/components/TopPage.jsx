import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      {/* 文字を上に表示 */}
      <h2 className="welcome-text">ようこそ MilkPOP Calendar へ</h2>

      {/* グラスモーフィズム背景を敷いたロゴ */}
      <div className="logo-wrapper">
        <img src="/logo.png" alt="MilkPOP Logo" className="logo-image" />
      </div>
    </div>
  );
};

export default TopPage;
