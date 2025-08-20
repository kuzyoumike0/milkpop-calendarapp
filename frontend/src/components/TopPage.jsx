import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* タイトル */}
      <h1 className="text-4xl font-bold text-center text-[#FDB9C8] mb-10">
        MilkPOP Calendar へようこそ
      </h1>

      {/* ナビカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 日程登録ページ */}
        <Link
          to="/link"
          className="block bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 hover:scale-105 transition transform"
        >
          <h2 className="text-2xl font-semibold text-[#FDB9C8] mb-2">
            日程登録ページ
          </h2>
          <p className="text-gray-400">
            複数日や範囲をカレンダーから選び、共有リンクを発行できます。
          </p>
        </Link>

        {/* 個人日程ページ */}
        <Link
          to="/personal"
          className="block bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 hover:scale-105 transition transform"
        >
          <h2 className="text-2xl font-semibold text-[#FDB9C8] mb-2">
            個人日程ページ
          </h2>
          <p className="text-gray-400">
            自分専用の予定を入力して保存できます。メモや時間帯も登録可能。
          </p>
        </Link>
      </div>

      {/* 補足 */}
      <div className="mt-12 text-center text-gray-400">
        <p>すべてのページで共有リンクと個人予定を組み合わせて活用できます。</p>
      </div>
    </div>
  );
}
