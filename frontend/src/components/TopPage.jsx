import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";

export default function TopPage() {
  return (
    <div className="top-page relative z-10 min-h-screen flex flex-col">
      {/* 共通ヘッダー */}
      <Header />

      {/* ロゴ画像（トップページ専用） */}
      <div className="flex justify-center mt-12 mb-8">
        <img
          src="/logo.png"
          alt="MilkPOP Logo"
          className="h-40 w-auto drop-shadow-2xl"
        />
      </div>

      {/* メインコンテンツ */}
      <main className="flex-grow flex flex-col items-center justify-start px-6 relative z-10">
        <div className="bg-white/10 rounded-2xl shadow-2xl p-10 text-center max-w-2xl backdrop-blur-md">
          <h2 className="text-3xl font-bold mb-6 text-[#FDB9C8] drop-shadow">
            ようこそ、MilkPOP Calendar へ
          </h2>
          <p className="mb-8 text-lg text-gray-200 leading-relaxed">
            スケジュールを登録したり、みんなと共有して調整することができます。<br />
            シンプルだけどお洒落で、使いやすいカレンダーアプリです。
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/link"
              className="bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-white px-6 py-3 rounded-xl shadow-lg font-semibold hover:opacity-90 transition"
            >
              日程登録ページへ
            </Link>
            <Link
              to="/personal"
              className="bg-gradient-to-r from-[#004CA0] to-[#FDB9C8] text-white px-6 py-3 rounded-xl shadow-lg font-semibold hover:opacity-90 transition"
            >
              個人日程登録ページへ
            </Link>
          </div>
        </div>
      </main>

      {/* フッター（任意） */}
      <footer className="text-gray-400 text-sm text-center py-6 opacity-60">
        © 2025 MilkPOP Calendar
      </footer>
    </div>
  );
}
