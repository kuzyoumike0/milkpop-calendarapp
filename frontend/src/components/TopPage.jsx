import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl font-bold">ようこそ！</h2>
      <p className="text-lg">個人用と共有用のスケジュールを登録できます。</p>
      <div className="space-x-4">
        <Link to="/personal" className="px-6 py-3 bg-pink-400 rounded-2xl shadow hover:bg-pink-500">
          個人スケジュール登録
        </Link>
        <Link to="/link" className="px-6 py-3 bg-blue-500 rounded-2xl shadow hover:bg-blue-600">
          共有スケジュール登録
        </Link>
      </div>
    </div>
  );
}
