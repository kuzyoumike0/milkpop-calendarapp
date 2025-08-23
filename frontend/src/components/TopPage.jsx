// frontend/src/components/TopPage.jsx
import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12">
      {/* ロゴ画像カード（中央ぞろえ・カード風・ホバー付き） */}
      <div className="card hover:scale-105 transition-transform w-full max-w-4xl flex justify-center mb-10">
        <div className="relative w-full flex justify-center">
          <img
            src="/logo.png"
            alt="MilkPOP Calendar Logo"
            className="max-w-full rounded-2xl shadow-lg"
            style={{ width: "1040px" }}
          />
          <h1 className="absolute inset-0 flex items-center justify-center text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
            MilkPOP Calendar
          </h1>
        </div>
      </div>

      {/* 本文メッセージ（中央ぞろえ） */}
      <p className="text-lg text-gray-700 max-w-2xl">
        あなたの予定を簡単に登録・共有できるカレンダーサービスです。
      </p>
    </main>
  );
};

export default TopPage;
