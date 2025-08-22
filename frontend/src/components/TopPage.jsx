// frontend/src/components/TopPage.jsx
import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      {/* ロゴ部分 */}
      <div className="logo-wrapper">
        <img src="/logo.png" alt="MilkPOP Logo" className="logo-image" />
      </div>

      {/* ウェルカムテキスト */}
      <h2 className="welcome-text">ようこそ MilkPOP Calendar へ</h2>

      {/* 説明文 */}
      <p style={{ marginTop: "1rem", color: "#555", fontSize: "1.1rem" }}>
        共有スケジュールを登録・管理して、みんなで予定を簡単に調整できます。
      </p>
    </div>
  );
};

export default TopPage;
