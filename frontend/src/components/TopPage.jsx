// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

function TopPage() {
  return (
    <div className="flex flex-col items-center justify-center mt-16 space-y-10">
      {/* 日程登録ページカード */}
      <Link
        to="/link"
        className="w-80 p-6 bg-black/70 rounded-2xl shadow-xl text-center 
                   hover:bg-black/80 hover:scale-105 transition transform"
      >
        <h2 className="text-2xl font-bold text-[#FDB9C8] mb-3">
          日程登録ページ
        </h2>
        <p className="text-gray-300 text-sm">
          自作カレンダーに日程を登録し、共有リンクを発行できます。
        </p>
      </Link>

      {/* 個人スケジュールカード */}
      <Link
        to="/personal"
        className="w-80 p-6 bg-black/70 rounded-2xl shadow-xl text-center 
                   hover:bg-black/80 hover:scale-105 transition transform"
      >
        <h2 className="text-2xl font-bold text-[#004CA0] mb-3">
          個人スケジュール
        </h2>
        <p className="text-gray-300 text-sm">
          タイトルやメモ、時間帯を設定して、自分専用の予定を管理できます。
        </p>
      </Link>
    </div>
  );
}

export default TopPage;
