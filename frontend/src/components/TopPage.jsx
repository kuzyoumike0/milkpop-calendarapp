// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

function TopPage() {
  return (
    <div className="flex flex-col items-center justify-center mt-20 space-y-12">
      {/* 日程登録ページカード */}
      <Link
        to="/link"
        className="block w-96 p-8 bg-pink-500/20 rounded-2xl shadow-lg text-center
                   hover:bg-pink-500/30 hover:scale-105 transition-all duration-300"
      >
        <h2 className="text-2xl font-bold text-[#FDB9C8] mb-3">日程登録ページ</h2>
        <p className="text-gray-200 text-sm">
          自作カレンダーに日程を登録し、共有リンクを発行できます。
        </p>
      </Link>

      {/* 個人スケジュールページカード */}
      <Link
        to="/personal"
        className="block w-96 p-8 bg-blue-600/20 rounded-2xl shadow-lg text-center
                   hover:bg-blue-600/30 hover:scale-105 transition-all duration-300"
      >
        <h2 className="text-2xl font-bold text-[#004CA0] mb-3">個人スケジュール</h2>
        <p className="text-gray-200 text-sm">
          タイトルやメモ、時間帯を設定して、自分専用の予定を管理できます。
        </p>
      </Link>
    </div>
  );
}

export default TopPage;
