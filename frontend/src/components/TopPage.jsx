import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-[color:var(--brand-black)] flex flex-col items-center py-12 px-4">
      {/* バナー */}
      <header className="w-full max-w-3xl mb-8 text-center">
        <h1 className="text-4xl font-bold text-[color:var(--brand-pink)] drop-shadow-md">
          MilkPOP Calendar
        </h1>
        <p className="text-gray-400 mt-2">みんなで予定を共有できるお洒落なカレンダー</p>
      </header>

      {/* カードメニュー */}
      <div className="w-full max-w-3xl space-y-6">
        {/* 日程登録ページ */}
        <div className="card text-center">
          <h2 className="card-title">共有スケジュール登録</h2>
          <p className="card-content mb-4">
            共有用のカレンダーに予定を登録して、リンクを発行できます。
          </p>
          <Link to="/link" className="btn inline-block">
            共有カレンダー登録へ
          </Link>
        </div>

        {/* 個人スケジュールページ */}
        <div className="card text-center">
          <h2 className="card-title">個人スケジュール登録</h2>
          <p className="card-content mb-4">
            自分専用のカレンダーに予定やメモを登録できます。
          </p>
          <Link to="/personal" className="btn inline-block">
            個人カレンダー登録へ
          </Link>
        </div>

        {/* 共有リンクページ */}
        <div className="card text-center">
          <h2 className="card-title">共有スケジュール確認</h2>
          <p className="card-content mb-4">
            発行されたリンクからみんなの予定をまとめて確認できます。
          </p>
          <Link to="/share" className="btn inline-block">
            共有スケジュール確認へ
          </Link>
        </div>
      </div>
    </div>
  );
}
