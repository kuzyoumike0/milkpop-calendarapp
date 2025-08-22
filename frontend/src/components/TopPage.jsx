import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="page-container">
      <div className="card" style={{ textAlign: "center" }}>
        <img
          alt="MilkPOP Logo"
          style={{ width: "180px", marginBottom: "20px" }}
        />
        <h2 className="page-title">ようこそ MilkPOP Calendar へ</h2>
        <p>あなたの予定をスマートに共有しましょう ✨</p>
      </div>
    </div>
  );
};

export default TopPage;
