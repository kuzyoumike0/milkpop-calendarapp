// frontend/src/components/TopPage.jsx
import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      {/* グラスモーフィズム背景を敷いたロゴ */}
      <div className="logo-wrapper">
        <img src="/logo.png" alt="MilkPOP Logo" className="logo-image" />
      </div>
      <h2 className="welcome-text">ようこそ MilkPOP Calendar へ</h2>
    </div>
  );
};

export default TopPage;
