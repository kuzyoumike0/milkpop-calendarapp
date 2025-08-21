import React from "react";
import { Link } from "react-router-dom";

function TopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-black flex items-center justify-center px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Link
          to="/link"
          className="w-80 p-8 bg-black/50 border border-[#FDB9C8]/30
                     rounded-2xl shadow-lg text-center backdrop-blur-md
                     hover:scale-105 hover:shadow-[#FDB9C8]/50 transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-[#FDB9C8] mb-3">日程登録ページ</h2>
          <p className="text-gray-300 text-sm">
            自作カレンダーに日程を登録し、共有リンクを発行できます。
          </p>
        </Link>

        <Link
          to="/personal"
          className="w-80 p-8 bg-black/50 border border-[#004CA0]/30
                     rounded-2xl shadow-lg text-center backdrop-blur-md
                     hover:scale-105 hover:shadow-[#004CA0]/50 transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-[#004CA0] mb-3">個人スケジュール</h2>
          <p className="text-gray-300 text-sm">
            タイトルやメモ、時間帯を設定して、自分専用の予定を管理できます。
          </p>
        </Link>
      </div>
    </div>
  );
}

export default TopPage;
