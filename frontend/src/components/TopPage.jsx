import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-10">
      <h2 className="text-4xl font-extrabold text-[#FDB9C8] drop-shadow-lg">
        ようこそ MilkPOP Calendar
      </h2>
      <p className="text-gray-300 text-lg">
        予定を登録して、リンクを発行して、みんなで共有しましょう。
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <Link
          className="bg-[#004CA0] hover:bg-[#FDB9C8] hover:text-black text-white px-8 py-4 rounded-2xl shadow-lg font-bold transition transform hover:scale-105"
          to="/link"
        >
          日程登録ページへ
        </Link>
        <Link
          className="bg-[#FDB9C8] hover:bg-[#004CA0] hover:text-white text-black px-8 py-4 rounded-2xl shadow-lg font-bold transition transform hover:scale-105"
          to="/personal"
        >
          個人スケジュールページへ
        </Link>
      </div>

      <div>
        <Link
          to="/sharelink"
          className="text-[#FDB9C8] underline hover:text-[#004CA0] transition"
        >
          発行された共有リンク一覧を見る
        </Link>
      </div>
    </div>
  );
}
