// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* バナー */}
      <header className="bg-[#004CA0] text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-2xl font-bold tracking-wide">
            MilkPOP Calendar
          </h1>
          <nav className="space-x-4">
            <Link
              to="/link"
              className="hover:text-[#FDB9C8] transition-colors"
            >
              日程登録
            </Link>
            <Link
              to="/personal"
              className="hover:text-[#FDB9C8] transition-colors"
            >
              個人スケジュール
            </Link>
          </nav>
        </div>
      </header>

      {/* メイン */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h2 className="text-3xl font-bold mb-10 text-[#FDB9C8] drop-shadow-md">
          ようこそ！スケジュールを登録しましょう
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* 日程登録カード */}
          <Link
            to="/link"
            className="bg-[#1a1a1a] rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-105 p-8 border border-[#004CA0]"
          >
            <h3 className="text-xl font-semibold text-[#FDB9C8] mb-3">
              日程登録ページ
            </h3>
            <p className="text-gray-300">
              カレンダーUIで複数日や範囲を選択し、共有リンクを作成できます。
            </p>
          </Link>

          {/* 個人スケジュールカード */}
          <Link
            to="/personal"
            className="bg-[#1a1a1a] rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-105 p-8 border border-[#FDB9C8]"
          >
            <h3 className="text-xl font-semibold text-[#004CA0] mb-3">
              個人スケジュール登録ページ
            </h3>
            <p className="text-gray-300">
              タイトル、メモ、日程範囲や複数選択、時間帯を設定して自分の予定を管理。
            </p>
          </Link>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-[#004CA0] text-white text-center py-4 text-sm">
        © 2025 MilkPOP Calendar
      </footer>
    </div>
  );
}
