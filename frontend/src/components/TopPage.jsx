import React from "react";
import { Link } from "react-router-dom";

function TopPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-10 bg-black">
      <Link
        to="/link"
        className="block w-80 p-6 bg-pink-500 text-white rounded-xl shadow-lg text-center hover:bg-pink-600 transition"
      >
        日程登録ページ
      </Link>

      <Link
        to="/personal"
        className="block w-80 p-6 bg-blue-600 text-white rounded-xl shadow-lg text-center hover:bg-blue-700 transition"
      >
        個人スケジュール
      </Link>
    </div>
  );
}

export default TopPage;
