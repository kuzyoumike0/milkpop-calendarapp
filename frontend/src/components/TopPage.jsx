// frontend/src/components/TopPage.jsx
import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <main className="flex-grow container mx-auto px-4 py-12 text-center">
      {/* ロゴと文字を重ねる */}
      <div className="relative flex justify-center mb-10">
        <img
          src="/logo.png"
          alt="MilkPOP Calendar Logo"
          className="max-w-full"
          style={{ width: "1040px" }}
        />
        <h1 className="absolute inset-0 flex items-center justify-center text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
          MilkPOP Calendar
        </h1>
      </div>

      <p className="text-lg mb-8 text-gray-700">
        あなたの予定を簡単に登録・共有できるカレンダーサービスです。
      </p>
    </main>
  );
};

export default TopPage;
