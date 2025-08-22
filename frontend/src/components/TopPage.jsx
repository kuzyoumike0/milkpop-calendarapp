import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      <h2 className="welcome-text">ようこそ MilkPOP Calendar へ</h2>

      <div className="logo-wrapper">
        <img src="/logo.png" alt="MilkPOP Logo" className="logo-image" />
      </div>
    </div>
  );
};

export default TopPage;
