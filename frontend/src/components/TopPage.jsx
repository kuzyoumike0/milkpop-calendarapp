import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const TopPage = () => {
  return (
    <div className="bg-gradient-to-b from-[#FDB9C8] via-white to-[#004CA0] min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col items-center px-6 pb-20">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-12 text-center space-y-10 mt-20">
          {/* 見出し */}
          <h2 className="text-3xl font-bold text-[#004CA0]">ようこそ！</h2>

          {/* ロゴ画像 */}
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="MilkPOP Calendar ロゴ"
              className="top-logo rounded-2xl shadow-2xl"
            />
          </div>

          {/* メッセージ */}
          <p className="text-lg text-gray-700 text-center">
            ここから日程登録ページや個人スケジュールページに移動できます。
          </p>

          {/* ボタンリンク（中央揃え） */}
          <div className="flex justify-center gap-8">
            <Link
              to="/register"
              className="bg-[#004CA0] text-white px-8 py-4 rounded-xl font-bold shadow hover:bg-[#FDB9C8] hover:text-black transition transform hover:scale-105 text-center"
            >
              日程登録ページへ
            </Link>
            <Link
              to="/personal"
              className="bg-[#FDB9C8] text-black px-8 py-4 rounded-xl font-bold shadow hover:bg-[#004CA0] hover:text-white transition transform hover:scale-105 text-center"
            >
              個人スケジュールページへ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TopPage;
