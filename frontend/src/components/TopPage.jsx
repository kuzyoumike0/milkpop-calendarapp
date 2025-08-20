import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="p-8 text-white text-center">
      <h1 className="text-3xl font-bold mb-6">カレンダー共有アプリ</h1>
      <div className="space-x-4">
        <Link to="/personal">
          <button className="bg-blue-600 px-6 py-3 rounded-lg">個人日程登録</button>
        </Link>
        <Link to="/share">
          <button className="bg-green-600 px-6 py-3 rounded-lg">日程登録（共有リンク発行）</button>
        </Link>
      </div>
    </div>
  );
}
