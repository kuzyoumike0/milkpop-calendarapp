// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

function TopPage() {
  return (
    <div className="flex flex-col items-center justify-center mt-20 space-y-12">
      {/* 日程登録ページカード */}
      <Link
        to="/link"
        className="block w-96 p-8 bg-gradient-to-br from-[#FDB9C8]/20 to-[#004CA0]/20
                   rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] text-center
                   border border-white/10 hover:border-[#FDB9C8] hover:shadow-[#FDB9C8]/40
                   transform hover:-translate-y-2 transition-all duration-300"
      >
        <h2 className="text-3xl font-extrabold text-[#FDB9C8] mb-4 drop-shadow-lg">
          日程登録ページ
        </h2>
        <p className="text-gray-200 text-base leading-relaxed">
          自作カレンダーに日程を登録し、共有リンクを発行できます。
        </p>
      </Link>

      {/* 個人スケジュールカード */}
      <Link
        to="/personal"
        className="block w-96 p-8 bg-gradient-to-br from-[#004CA0]/20 to-[#FDB9C8]/20
                   rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] text-center
                   border border-white/10 hover:border-[#004CA0] hover:shadow-[#004CA0]/40
                   transform hover:-translate-y-2 transition-all duration-300"
      >
        <h2 className="text-3xl font-extrabold text-[#004CA0] mb-4 drop-shadow-lg">
          個人スケジュール
        </h2>
        <p className="text-gray-200 text-base leading-relaxed">
          タイトルやメモ、時間帯を設定して、自分専用の予定を管理できます。
        </p>
      </Link>
    </div>
  );
}

export default TopPage;
