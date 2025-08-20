import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6">トップページ</h2>
      <div className="space-x-4">
        <Link to="/link" className="bg-[#FDB9C8] text-black px-4 py-2 rounded-xl">日程登録</Link>
        <Link to="/personal" className="bg-[#004CA0] text-white px-4 py-2 rounded-xl">個人日程</Link>
      </div>
    </div>
  );
}
