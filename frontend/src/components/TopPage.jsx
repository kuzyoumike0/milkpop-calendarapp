import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl">ようこそ MilkPOP Calendar</h2>
      <div className="space-x-6">
        <Link className="bg-[#004CA0] text-white px-4 py-2 rounded" to="/link">日程登録</Link>
        <Link className="bg-[#FDB9C8] text-black px-4 py-2 rounded" to="/personal">個人スケジュール</Link>
      </div>
    </div>
  );
}
