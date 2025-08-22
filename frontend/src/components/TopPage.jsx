// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const TopPage = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* ===== バナー ===== */}
      <header className="bg-[#004CA0] text-white py-4 shadow-md flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link
            to="/register"
            className="px-3 py-2 rounded-lg bg-[#FDB9C8] text-black font-semibold hover:opacity-80"
          >
            日程登録ページ
          </Link>
          <Link
            to="/personal"
            className="px-3 py-2 rounded-lg bg-[#FDB9C8] text-black font-semibold hover:opacity-80"
          >
            個人スケジュール
          </Link>
        </nav>
      </header>

      {/* ===== メインコンテンツ ===== */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-3xl font-bold mb-6 text-[#FDB9C8]">
          ようこそ、MilkPOP Calendar へ
        </h2>
        <p className="text-gray-300 mb-10 max-w-xl">
          日程を登録して仲間と共有したり、自分だけのスケジュールを管理できます。
          <br />
          下のボタンから始めましょう！
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          <Link
            to="/register"
            className="px-6 py-4 rounded-xl bg-[#FDB9C8] text-black font-bold shadow-lg hover:opacity-80"
          >
            日程登録ページへ
          </Link>
          <Link
            to="/personal"
            className="px-6 py-4 rounded-xl bg-[#004CA0] text-white font-bold shadow-lg hover:opacity-80"
          >
            個人スケジュールへ
          </Link>
        </div>
      </main>

      {/* ===== フッター ===== */}
      <footer className="bg-[#1a1a1a] text-gray-400 text-center py-4">
        © 2025 MilkPOP Calendar
      </footer>
    </div>
  );
};

export default TopPage;
