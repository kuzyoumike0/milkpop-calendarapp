import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="text-center mt-20">
      <h2 className="text-4xl mb-6 font-bold text-[#FDB9C8]">ようこそ</h2>
      <p className="mb-8">ここから日程を登録したり、個人予定を入力できます。</p>
      <div className="space-x-6">
        <Link
          to="/link"
          className="bg-[#004CA0] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-[#FDB9C8] hover:text-black"
        >
          日程登録ページへ
        </Link>
        <Link
          to="/personal"
          className="bg-[#FDB9C8] text-black px-6 py-3 rounded-2xl shadow-lg hover:bg-[#004CA0] hover:text-white"
        >
          個人日程登録ページへ
        </Link>
      </div>
    </div>
  );
}
