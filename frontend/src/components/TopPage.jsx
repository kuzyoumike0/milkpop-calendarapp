import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="page-container">
      <div className="card">
        <h1 className="page-title">ようこそ！MilkPOP Calendar</h1>
        <p style={{ color: "#000" }}>
          このカレンダーでは予定を登録して共有することができます。
        </p>
      </div>
    </div>
  );
};

export default TopPage;
