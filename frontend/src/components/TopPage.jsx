import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* タイトル */}
      <h1 className="text-4xl font-bold text-center text-[#FDB9C8] mb-8">
        カレンダー共有アプリ
      </h1>

      {/* カード型メニュー */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 個人日程登録 */}
        <Link
          to="/personal"
          className="block bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
        >
          <h2 className="text-2xl font-semibold text-[#FDB9C8] mb-3">
            個人日程登録
          </h2>
          <p className="text-gray-300 text-sm">
            あなた自身の日程を登録して保存します。範囲選択や複数選択も可能で、
            開始・終了時刻も指定できます。
          </p>
        </Link>

        {/* 共有日程登録 */}
        <Link
          to="/link"
          className="block bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
        >
          <h2 className="text-2xl font-semibold text-[#FDB9C8] mb-3">
            共有日程登録
          </h2>
          <p className="text-gray-300 text-sm">
            複数人で予定を共有するリンクを作成できます。
            参加者が○✖で回答でき、結果をすぐ確認できます。
          </p>
        </Link>

        {/* 共有ページにアクセス */}
        <Link
          to="/share"
          className="block bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
        >
          <h2 className="text-2xl font-semibold text-[#FDB9C8] mb-3">
            共有ページへ
          </h2>
          <p className="text-gray-300 text-sm">
            発行された共有リンクから参加し、○✖で回答できます。
          </p>
        </Link>
      </div>
    </div>
  );
}
