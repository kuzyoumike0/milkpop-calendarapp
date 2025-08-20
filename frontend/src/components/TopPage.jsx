import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";

export default function TopPage() {
  return (
    <div className="top-page relative z-10">
      <Header />

      <main className="flex flex-col items-center justify-center py-16 px-6 relative z-10">
        <div className="bg-white/10 rounded-2xl shadow-xl p-10 text-center max-w-2xl backdrop-blur-md">
          <h2 className="text-3xl font-bold mb-6">
            ようこそ、MilkPOP Calendar へ
          </h2>
          <p className="mb-8 text-lg text-gray-200">
            スケジュールを登録したり、みんなと共有して調整することができます。
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/link"
              className="bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-white px-6 py-3 rounded-xl shadow-lg font-semibold hover:opacity-90"
            >
              日程登録ページへ
            </Link>
            <Link
              to="/personal"
              className="bg-gradient-to-r from-[#004CA0] to-[#FDB9C8] text-white px-6 py-3 rounded-xl shadow-lg font-semibold hover:opacity-90"
            >
              個人日程登録ページへ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
