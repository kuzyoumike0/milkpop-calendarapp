import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="flex flex-col items-center text-center px-4 py-12 bg-gradient-to-b from-[#FDB9C8] via-white to-[#004CA0] min-h-full">
      {/* バナー */}
      <div className="w-full bg-black text-white py-6 shadow-lg mb-10">
        <h1 className="text-3xl font-bold">MilkPOP Calendar</h1>
      </div>

      {/* メイン見出し */}
      <h2 className="text-4xl font-extrabold text-black mb-6 drop-shadow-lg">
        ようこそ MilkPOP Calendar へ 🎉
      </h2>

      {/* ロゴ画像 */}
      <img
        src="/logo.png"
        alt="MilkPOP Calendar Logo"
        className="w-[1040px] max-w-full h-auto shadow-lg rounded-xl"
      />

      {/* 説明文 */}
      <p className="text-lg text-gray-700 max-w-2xl mt-10 leading-relaxed">
        このアプリは、Discord ログインを利用して
        グループの日程調整や個人スケジュール管理ができるツールです。
      </p>
    </div>
  );
};

export default TopPage;
