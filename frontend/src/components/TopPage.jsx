import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6 text-[#004CA0]">ようこそ！</h2>
      <p className="mb-8">MilkPOP Calendarへようこそ。スケジュールを登録・共有してみましょう。</p>
      <div className="flex justify-center space-x-6">
        <Link
          to="/link"
          className="bg-[#FDB9C8] text-black px-6 py-3 rounded-2xl shadow hover:scale-105"
        >
          日程登録ページ
        </Link>
        <Link
          to="/personal"
          className="bg-[#004CA0] text-white px-6 py-3 rounded-2xl shadow hover:scale-105"
        >
          個人スケジュール
        </Link>
      </div>
    </div>
  );
}
