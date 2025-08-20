import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* バナー */}
      <header className="bg-[#004CA0] text-white text-center py-4 text-2xl font-bold">
        MilkPOP Calendar
      </header>

      <main className="flex flex-col flex-grow items-center justify-center gap-8">
        <h1 className="text-4xl font-extrabold text-[#FDB9C8] mb-6">
          📅 スケジュール管理をシンプルに
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-3/4 max-w-3xl">
          <Link
            to="/link"
            className="p-6 rounded-2xl shadow-lg bg-[#004CA0]/80 hover:bg-[#004CA0] transition text-white text-center"
          >
            <span className="text-3xl">🔗</span>
            <p className="mt-3 text-lg font-semibold">日程登録ページへ</p>
          </Link>

          <Link
            to="/personal"
            className="p-6 rounded-2xl shadow-lg bg-[#FDB9C8]/80 hover:bg-[#FDB9C8] transition text-black text-center"
          >
            <span className="text-3xl">📝</span>
            <p className="mt-3 text-lg font-semibold">個人日程登録ページへ</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
