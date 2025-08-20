import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-4xl font-extrabold mb-6 text-[#FDB9C8] drop-shadow">
          ようこそ！MilkPOP Calendarへ
        </h2>
        <p className="text-lg mb-10 max-w-2xl">
          日程を登録して、みんなと共有しましょう。
          <br />
          個人のスケジュール管理もこちらからどうぞ。
        </p>
        <div className="flex gap-6">
          <Link
            to="/link"
            className="px-8 py-4 bg-[#004CA0] rounded-2xl text-white text-xl font-semibold shadow-lg hover:bg-[#FDB9C8] hover:text-black transition"
          >
            日程登録ページへ
          </Link>
          <Link
            to="/personal"
            className="px-8 py-4 bg-[#FDB9C8] rounded-2xl text-black text-xl font-semibold shadow-lg hover:bg-[#004CA0] hover:text-white transition"
          >
            個人スケジュールページへ
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
