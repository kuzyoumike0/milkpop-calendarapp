import React from "react";
import Header from "./Header"; // 共通ヘッダー
import "../index.css";

const TopPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ===== ヘッダー ===== */}
      <Header />

      {/* ===== メインコンテンツ ===== */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6 mt-28">
       <div className="logo">
  <Link to="/">
    <img src="/logo.png" alt="MilkPOP Calendar" />
  </Link>
</div>
        />

        {/* 説明文 */}
        <p className="text-lg text-gray-300 max-w-3xl leading-relaxed mx-auto">
          MilkPOP Calendar は、複数人での日程調整や個人スケジュールの管理を
          シンプルでわかりやすいUIでサポートするカレンダーサービスです。<br />
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
