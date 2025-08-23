import React from "react";
import { Link } from "react-router-dom";

const TopPage = () => {
  return (
    <div className="bg-gradient-to-b from-[#FDB9C8] via-white to-[#004CA0] min-h-screen flex flex-col">
      {/* ===== バナー ===== */}
      <header className="bg-black text-white text-center py-4 shadow-lg z-10">
        <h1 className="text-3xl font-bold">MilkPOP Calendar</h1>
      </header>

      {/* ===== コンテンツ ===== */}
      <main className="flex-grow flex flex-col items-center justify-center px-6">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-10 text-center space-y-8 mt-10">
          <h2 className="text-2xl font-semibold text-[#004CA0]">ようこそ！</h2>
          <p className="text-gray-600">
            ここから日程登録ページや個人スケジュールページに移動できます。
          </p>

          {/* ===== ロゴ画像表示 ===== */}
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="MilkPOP Calendar ロゴ"
              className="rounded-2xl shadow-lg w-1/2 max-w-xs"
            />
          </div>

          <div className="flex justify-center gap-6">
            <Link
              to="/register"
              className="bg-[#004CA0] text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-[#FDB9C8] hover:text-black transition"
            >
              日程登録ページへ
            </Link>
            <Link
              to="/personal"
              className="bg-[#FDB9C8] text-black px-6 py-3 rounded-xl font-bold shadow hover:bg-[#004CA0] hover:text-white transition"
            >
              個人スケジュールページへ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopPage;
