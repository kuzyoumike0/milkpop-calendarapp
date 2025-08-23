// frontend/src/components/TopPage.jsx
import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <main>
      {/* ロゴ画像カード */}
      <div className="card hover:scale-105 transition-transform w-full max-w-4xl mx-auto mb-10">
        <img
          src="/logo.png"
          alt="MilkPOP Calendar Logo"
          className="max-w-full rounded-2xl shadow-lg mx-auto"
          style={{ width: "1040px" }}
        />
      </div>

      {/* 本文カード */}
      <div className="top-message-card">
        あなたの予定を簡単に登録・共有できるカレンダーサービスです。
      </div>
    </main>
  );
};

export default TopPage;
