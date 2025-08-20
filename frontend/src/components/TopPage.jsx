import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-6">
      <h1 className="text-3xl font-bold">カレンダー共有アプリ</h1>
      <div className="space-x-4">
        <Link
          to="/personal"
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500"
        >
          個人スケジュール登録
        </Link>
        <Link
          to="/link"
          className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-500"
        >
          日程登録（共有リンク発行）
        </Link>
      </div>
    </div>
  );
}
