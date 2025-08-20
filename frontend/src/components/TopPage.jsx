import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold text-brandPink">MilkPOP Calendar</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        <Link to="/link" className="card hover:shadow-xl transition">
          <h2 className="card-title">日程登録ページ</h2>
          <p className="card-content">共有用のスケジュールを登録できます。</p>
        </Link>

        <Link to="/personal" className="card hover:shadow-xl transition">
          <h2 className="card-title">個人スケジュールページ</h2>
          <p className="card-content">自分用の予定を管理できます。</p>
        </Link>
      </div>
    </div>
  );
}
