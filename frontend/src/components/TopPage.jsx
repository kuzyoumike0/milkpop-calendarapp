// frontend/src/components/TopPage.jsx
import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12">
      {/* ロゴ画像カード */}
      <div className="card hover:scale-105 transition-transform w-full max-w-4xl mx-auto flex flex-col items-center mb-10">
        <img
          src="/logo.png"
          alt="MilkPOP Calendar Logo"
          className="max-w-full rounded-2xl shadow-lg mx-auto"
          style={{ width: "1040px" }}
        />
        <h1 className="mt-6 text-5xl md:text-6xl font-bold text-[#004CA0] title-text text-center">
          MilkPOP Calendar
        </h1>
      </div>

      {/* 本文カード */}
      <div className="top-message-card">
        あなたの予定を簡単に登録・共有できるカレンダーサービスです。
      </div>
    </main>
  );
};

export default TopPage;
