import React from "react";
import Header from "./Header";  // 共通ヘッダーを呼び出し
import "../index.css";

const TopPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ===== ヘッダー ===== */}
      <Header />

      {/* ===== メインコンテンツ ===== */}
      <main className="flex flex-col items-center justify-center flex-1 text-center p-6">
        {/* （public/logo.png を置く想定） */}
        <img
          src="/logo.png"
          alt="MilkPOP Calendar"
          className="w-2/3 max-w-md rounded-xl shadow-lg mb-6"
        />

        {/* 説明文 */}
        <h2 className="text-3xl font-bold text-[#FDB9C8] mb-4">
          スケジュール管理をもっとカンタンに
        </h2>
        <p className="text-lg text-gray-300 max-w-xl">
          MilkPOP Calendar は、複数人での日程調整や個人スケジュールの管理を
          シンプルでわかりやすいUIでサポートするカレンダーサービスです。
          Discordアカウントでログインして、すぐに利用を開始できます。
        </p>
      </main>

      {/* ===== フッター ===== */}
      <footer className="text-center text-gray-500 p-4">
        <p>© 2025 MilkPOP Calendar</p>
      </footer>
    </div>
  );
};

export default TopPage;
