import React from "react";
import { Link } from "react-router-dom";
import { LinkIcon, UserIcon } from "./Icons";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* バナー */}
      <header className="bg-[#004CA0] text-white text-center py-4 text-2xl font-bold shadow-md">
        MilkPOP Calendar
      </header>

      <main className="flex flex-col flex-grow items-center justify-center gap-8">
        <h1 className="text-4xl font-extrabold text-[#FDB9C8] mb-10">
          スケジュール管理をシンプルに
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-4/5 max-w-4xl">
          {/* 日程登録ページ */}
          <Link
            to="/link"
            className="group p-8 rounded-2xl shadow-lg bg-gradient-to-r from-[#004CA0] to-[#FDB9C8] hover:scale-105 hover:shadow-2xl transition transform flex flex-col items-center justify-center"
          >
            <div className="bg-black/30 p-4 rounded-full mb-4 group-hover:bg-black/50 transition">
              <LinkIcon className="w-12 h-12 text-white" />
            </div>
            <p className="mt-2 text-xl font-semibold">日程登録ページへ</p>
          </Link>

          {/* 個人日程登録ページ */}
          <Link
            to="/personal"
            className="group p-8 rounded-2xl shadow-lg bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] hover:scale-105 hover:shadow-2xl transition transform flex flex-col items-center justify-center"
          >
            <div className="bg-black/30 p-4 rounded-full mb-4 group-hover:bg-black/50 transition">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <p className="mt-2 text-xl font-semibold">個人日程登録ページへ</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
