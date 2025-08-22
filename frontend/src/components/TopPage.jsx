import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="page-container">
      {/* トップ画像 */}
      <div className="top-image">
        <img src="/header-bg.png" alt="Top Visual" />
      </div>

      <div className="card" style={{ textAlign: "center" }}>
        <h2 className="page-title">ようこそ MilkPOP Calendar へ</h2>
        <p>あなたの予定をスマートに共有しましょう ✨</p>
      </div>
    </div>
  );
};

export default TopPage;
