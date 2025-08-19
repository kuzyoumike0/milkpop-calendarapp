import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-[#004CA0]">ようこそ！</h2>
      <p className="mt-2">日程を登録したり、個人スケジュールを管理できます。</p>
      <div className="mt-6 space-x-4">
        <Link to="/share" className="bg-[#FDB9C8] px-4 py-2 rounded-xl">日程登録ページへ</Link>
        <Link to="/personal" className="bg-[#004CA0] text-white px-4 py-2 rounded-xl">個人スケジュールへ</Link>
      </div>
    </div>
  );
}
