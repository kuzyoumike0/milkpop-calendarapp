// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

function TopPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-10 text-center">
      {/* タイトル */}
      <h1 className="text-4xl md:text-5xl font-bold text-pink drop-shadow-lg">
        MilkPOP Calendar
      </h1>
      <p className="text-gray-300 text-lg">
        あなた専用のスケジュール管理カレンダーへようこそ 🎉
      </p>

      {/* メニューリンク */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Link
          to="/link"
          className="w-72 p-6 bg-gradient-to-br from-pink/30 to-deepblue/30
                     rounded-2xl shadow-lg backdrop-blur-sm
                     hover:scale-105 hover:shadow-pink/40 transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-pink mb-2">日程登録ページ</h2>
          <p className="text-gray-200 text-sm">
            自作カレンダーに日程を登録し、共有リンクを発行できます。
          </p>
        </Link>

        <Link
          to="/personal"
          className="w-72 p-6 bg-gradient-to-br from-deepblue/30 to-pink/30
                     rounded-2xl shadow-lg backdrop-blur-sm
                     hover:scale-105 hover:shadow-deepblue/40 transition-all duration-300"
        >
          <h2 className="text-2xl font-bold text-deepblue mb-2">個人スケジュール</h2>
          <p className="text-gray-200 text-sm">
            タイトルやメモ、時間帯を設定して、自分専用の予定を管理できます。
          </p>
        </Link>
      </div>
    </div>
  );
}

export default TopPage;
