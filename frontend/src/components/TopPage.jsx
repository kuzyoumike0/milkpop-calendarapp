import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="p-8 text-white text-center">
      <h1 className="text-3xl font-bold mb-6">カレンダーアプリ</h1>
      <div className="space-x-4">
        <Link
          to="/personal"
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          個人スケジュール登録
        </Link>
        <Link
          to="/schedule"
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        >
          日程登録（共有リンク発行）
        </Link>
      </div>
    </div>
  );
}
