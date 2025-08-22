import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="page-container">
      <main style={{ textAlign: "center", padding: "40px" }}>
        <h2 style={{ fontSize: "2.5rem" }}>ようこそ MilkPOP Calendar へ 🎉</h2>

        {/* ロゴ画像 */}
        <img
          src="/logo.png"
          alt="MilkPOP Calendar Logo"
          style={{
            width: "1040px",
            maxWidth: "100%",
            height: "auto",
            margin: "20px auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            borderRadius: "12px",
          }}
        />

        <p style={{ fontSize: "1.2rem", marginTop: "24px", lineHeight: "1.8" }}>
          このアプリは、Discord ログインを利用して
          グループの日程調整や個人スケジュール管理ができるツールです。
        </p>
      </main>
    </div>
  );
};

export default TopPage;
