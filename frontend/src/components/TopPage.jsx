import React from "react";
import { Link } from "react-router-dom";  // ← これが必要！

const TopPage = () => {
  return (
    <div className="p-6 bg-gradient-to-b from-[#FDB9C8] via-white to-[#004CA0] min-h-screen">
      <header className="bg-black text-white text-center py-4 mb-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">MilkPOP Calendar</h1>
      </header>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <h2 className="text-2xl font-semibold text-[#004CA0]">ようこそ！</h2>
        <p className="text-gray-600">
          ここから日程登録ページや個人スケジュールページに移動できます。
        </p>

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
    </div>
  );
};

export default TopPage;
