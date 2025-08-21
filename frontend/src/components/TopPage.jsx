// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

function TopPage() {
  return (
    <div className="grid md:grid-cols-2 gap-8 mt-10">
      {/* 日程登録ページカード */}
      <Link
        to="/link"
        className="p-8 bg-black/60 rounded-2xl shadow-xl hover:shadow-[#FDB9C8]/40 transition transform hover:-translate-y-1"
      >
        <h2 className="text-2xl font-bold text-[#FDB9C8] mb-3">日程登録ページ</h2>
        <p className="text-gray-300">
          自作カレンダーに日程を登録し、共有リンクを発行できます。
        </p>
      </Link>

      {/* 個人スケジュールページカード */}
      <Link
        to="/personal"
        className="p-8 bg-black/60 rounded-2xl shadow-xl hover:shadow-[#004CA0]/40 transition transform hover:-translate-y-1"
      >
        <h2 className="text-2xl font-bold text-[#004CA0] mb-3">個人スケジュール</h2>
        <p className="text-gray-300">
          タイトル、メモ、時間帯を入力して自分専用の予定を登録できます。
        </p>
      </Link>
    </div>
  );
}

export default TopPage;
