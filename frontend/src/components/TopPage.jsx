import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const TopPage = () => {
  return (
    <div className="bg-gradient-to-b from-[#FDB9C8] via-white to-[#004CA0] min-h-screen flex flex-col">
      <Header />

      {/* ===== mainにはフッター分の余白を追加 ===== */}
      <main className="flex-grow flex flex-col items-center px-6 pb-20">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-10 text-center space-y-8 mt-20">
          <h2 className="text-2xl">ようこそ！</h2>
          <p className="text-gray-600">
            ここから日程登録ページや個人スケジュールページに移動できます。
          </p>

          <div className="flex justify-center">
  <img
    src="/logo.png"
    alt="MilkPOP Calendar ロゴ"
    className="top-logo rounded-2xl shadow-2xl"
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

      <Footer />
    </div>
  );
};

export default TopPage;
