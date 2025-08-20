import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <h2 className="text-3xl font-bold text-[#FDB9C8]">ようこそ！</h2>
      <p className="text-lg">日程を登録して共有したり、個人スケジュールを管理できます。</p>
      <div className="space-x-4">
        <Link
          to="/link"
          className="bg-[#004CA0] text-white px-6 py-3 rounded-2xl shadow hover:bg-blue-900"
        >
          日程登録ページへ
        </Link>
        <Link
          to="/personal"
          className="bg-[#FDB9C8] text-black px-6 py-3 rounded-2xl shadow hover:bg-pink-400"
        >
          個人スケジュールへ
        </Link>
      </div>
    </div>
  );
}
