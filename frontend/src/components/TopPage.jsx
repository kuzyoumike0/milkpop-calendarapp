import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl font-bold text-[#FDB9C8]">トップページ</h2>
      <div className="flex justify-center space-x-6">
        <Link
          to="/link"
          className="px-6 py-3 bg-[#004CA0] text-white rounded-2xl shadow-lg hover:bg-[#FDB9C8] hover:text-black transition"
        >
          日程登録ページへ
        </Link>
        <Link
          to="/personal"
          className="px-6 py-3 bg-[#004CA0] text-white rounded-2xl shadow-lg hover:bg-[#FDB9C8] hover:text-black transition"
        >
          個人スケジュールページへ
        </Link>
      </div>
    </div>
  );
}
