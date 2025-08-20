import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center text-[#FDB9C8] mb-10">
        スケジュール管理トップページ
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* 日程登録ページ */}
        <Link
          to="/link"
          className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-8 hover:border-[#FDB9C8] transition transform hover:-translate-y-1"
        >
          <h2 className="text-2xl font-semibold text-[#FDB9C8] mb-3">
            日程登録ページ
          </h2>
          <p className="text-gray-400">
            タイトルと日程を入力して、範囲選択や複数選択で登録。共有リンクを発行できます。
          </p>
        </Link>

        {/* 個人日程登録ページ */}
        <Link
          to="/personal"
          className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-8 hover:border-[#FDB9C8] transition transform hover:-translate-y-1"
        >
          <h2 className="text-2xl font-semibold text-[#FDB9C8] mb-3">
            個人日程登録ページ
          </h2>
          <p className="text-gray-400">
            個人用にメモ付きで日程を登録。共有用とは別に管理できます。
          </p>
        </Link>
      </div>
    </div>
  );
}
