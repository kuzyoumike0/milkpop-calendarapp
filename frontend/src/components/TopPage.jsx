import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-extrabold text-[#FDB9C8] mb-6">
        ようこそ、MilkPOP Calendarへ
      </h2>
      <p className="mb-8 text-gray-300">
        あなたの予定を登録して、みんなで共有しましょう。
        <br />
        上のバナーからも遷移できますが、以下のボタンからもページに移動できます。
      </p>

      <div className="flex justify-center space-x-6">
        <Link
          to="/link"
          className="px-6 py-3 rounded-2xl bg-[#004CA0] text-white font-bold shadow-md hover:bg-[#FDB9C8] hover:text-black transition"
        >
          日程登録ページへ
        </Link>
        <Link
          to="/personal"
          className="px-6 py-3 rounded-2xl bg-[#FDB9C8] text-black font-bold shadow-md hover:bg-[#004CA0] hover:text-white transition"
        >
          個人日程登録ページへ
        </Link>
      </div>
    </div>
  );
}
