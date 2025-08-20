import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      {/* タイトル */}
      <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-10">
        MilkPOP Calendar
      </h1>

      {/* ボタン群 */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* 個人用 */}
        <Link
          to="/personal"
          className="px-8 py-4 rounded-2xl font-bold shadow-lg backdrop-blur-md 
            bg-[#FDB9C8]/80 text-black hover:bg-[#FDB9C8] transition"
        >
          📝 個人スケジュール
        </Link>

        {/* 共有用 */}
        <Link
          to="/link"
          className="px-8 py-4 rounded-2xl font-bold shadow-lg backdrop-blur-md 
            bg-[#004CA0]/80 text-white hover:bg-[#004CA0] transition"
        >
          🤝 共有スケジュール
        </Link>
      </div>
    </div>
  );
}
