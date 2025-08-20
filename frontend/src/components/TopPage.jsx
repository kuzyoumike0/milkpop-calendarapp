// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#1a1a1a] text-white flex flex-col">
      {/* バナー */}
      <header className="bg-black/70 backdrop-blur-md border-b border-[#FDB9C8]/30 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-8 py-4">
          <h1 className="text-2xl font-extrabold tracking-wide text-[#FDB9C8] drop-shadow-lg">
            MilkPOP Calendar
          </h1>
          <nav className="space-x-6 font-medium">
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

      {/* Hero セクション */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-28 pb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] bg-clip-text text-transparent drop-shadow-lg">
          スケジュールをもっとスマートに
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mb-12 leading-relaxed">
          MilkPOP Calendar で、予定を登録して仲間と共有。  
          おしゃれで直感的なカレンダー体験を。
        </p>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full">
          {/* 日程登録カード */}
          <motion.div
            whileHover={{ scale: 1.05, y: -6 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              to="/link"
              className="block bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-[#004CA0]/40 shadow-lg hover:shadow-2xl transition"
            >
              <h3 className="text-2xl font-semibold text-[#FDB9C8] mb-4">
                日程登録ページ
              </h3>
              <p className="text-gray-300 leading-relaxed">
                カレンダーUIで複数日や範囲を選んで共有リンクを発行。  
                仲間と予定をシェアしましょう。
              </p>
            </Link>
          </motion.div>

          {/* 個人スケジュールカード */}
          <motion.div
            whileHover={{ scale: 1.05, y: -6 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              to="/personal"
              className="block bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-[#FDB9C8]/40 shadow-lg hover:shadow-2xl transition"
            >
              <h3 className="text-2xl font-semibold text-[#004CA0] mb-4">
                個人スケジュール登録ページ
              </h3>
              <p className="text-gray-300 leading-relaxed">
                タイトル、メモ、時間帯を登録して  
                あなただけのカレンダーをつくりましょう。
              </p>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-black/80 backdrop-blur-md text-gray-400 text-center py-6 text-sm border-t border-[#004CA0]/30">
        © 2025 MilkPOP Calendar. All rights reserved.
      </footer>
    </div>
  );
}
