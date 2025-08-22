// frontend/src/components/TopPage.jsx
import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      {/* 文字を先に表示 */}
      <h2 className="welcome-text">ようこそ MilkPOP Calendar へ</h2>

      {/* ロゴ画像は小さめに */}
      <div className="logo-wrapper">
        <img src="/logo.png" alt="MilkPOP Logo" className="logo-image" />
      </div>
    </div>
  );
};

export default TopPage;
