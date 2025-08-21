// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

function TopPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Link
          to="/link"
          className="w-80 p-8 bg-gradient-to-br from-[#FDB9C8]/30 to-[#004CA0]/30
                     rounded-2xl shadow-xl text-center
                     hover:scale-105 hover:shadow-[#FDB9C8]/40
                     transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-[#FDB9C8] mb-3">日程登録ページ</h2>
          <p className="text-gray-200 text-sm">
            自作カレンダーに日程を登録し、共有リンクを発行できます。
          </p>
        </Link>

        <Link
          to="/personal"
          className="w-80 p-8 bg-gradient-to-br from-[#004CA0]/30 to-[#FDB9C8]/30
                     rounded-2xl shadow-xl text-center
                     hover:scale-105 hover:shadow-[#004CA0]/40
                     transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-[#004CA0] mb-3">個人スケジュール</h2>
          <p className="text-gray-200 text-sm">
            タイトルやメモ、時間帯を設定して、自分専用の予定を管理できます。
          </p>
        </Link>
      </div>
    </div>
  );
}

// 🔴 これを忘れると今のエラーが出ます
export default TopPage;
