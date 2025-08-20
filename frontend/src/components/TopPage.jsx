import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="p-6 text-center text-white">
      <h1 className="text-3xl font-bold mb-6">スケジュール管理アプリ</h1>
      <div className="space-x-4">
        <Link to="/personal" className="bg-green-600 px-4 py-2 rounded">
          個人スケジュール登録
        </Link>
        <Link to="/share" className="bg-blue-600 px-4 py-2 rounded">
          日程登録（共有リンク発行）
        </Link>
      </div>
    </div>
  );
}
