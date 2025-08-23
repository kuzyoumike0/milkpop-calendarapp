// frontend/src/components/TopPage.jsx
import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center">
      {/* ロゴ画像カード */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-10 max-w-4xl w-full flex justify-center">
        <div className="relative w-full flex justify-center">
          {/* ロゴ画像 */}
          <img
            src="/logo.png"
            alt="MilkPOP Calendar Logo"
            className="max-w-full rounded-xl"
            style={{ width: "1040px" }}
          />
          {/* ロゴ上のテキスト */}
          <h1 className="absolute inset-0 flex items-center justify-center text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
            MilkPOP Calendar
          </h1>
        </div>
      </div>

      {/* メッセージ */}
      <p className="text-lg text-gray-700 text-center max-w-2xl">
        あなたの予定を簡単に登録・共有できるカレンダーサービスです。
      </p>
    </main>
  );
};

export default TopPage;
