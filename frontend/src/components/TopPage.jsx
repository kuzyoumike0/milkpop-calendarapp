import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      {/* バナー */}
      <header className="bg-black border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-4 md:px-8 py-4">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide text-[#FDB9C8]">
            MilkPOP Calendar
          </h1>
          <nav className="space-x-4 md:space-x-6 font-medium text-sm md:text-base">
            <Link to="/link" className="hover:text-[#FDB9C8] transition-colors">
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
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 pt-24 md:pt-28 pb-12 md:pb-16">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] bg-clip-text text-transparent"
        >
          スケジュールをもっとスマートに
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="text-gray-300 text-base md:text-lg max-w-xl md:max-w-2xl mb-10 leading-relaxed"
        >
          MilkPOP Calendar で予定を登録し、仲間とシェア。 シンプルで美しいカレンダー体験を。
        </motion.p>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl w-full">
          {/* 日程登録カード */}
          <motion.div
            whileHover={{ scale: 1.03, y: -6 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link
              to="/link"
              className="block rounded-2xl p-6 md:p-10 bg-[#111]/80 border border-gray-700 shadow-lg hover:shadow-2xl hover:border-[#FDB9C8] transition"
            >
              <h3 className="text-xl md:text-2xl font-semibold text-[#FDB9C8] mb-3 md:mb-4">
                日程登録ページ
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                カレンダーUIで複数日や範囲を選択して共有リンクを発行。仲間と予定を簡単にシェアできます。
              </p>
            </Link>
          </motion.div>

          {/* 個人スケジュールカード */}
          <motion.div
            whileHover={{ scale: 1.03, y: -6 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Link
              to="/personal"
              className="block rounded-2xl p-6 md:p-10 bg-[#111]/80 border border-gray-700 shadow-lg hover:shadow-2xl hover:border-[#004CA0] transition"
            >
              <h3 className="text-xl md:text-2xl font-semibold text-[#004CA0] mb-3 md:mb-4">
                個人スケジュール登録ページ
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                タイトル・メモ・時間帯を登録して、あなた専用のカレンダーを作りましょう。
              </p>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-black border-t border-gray-800 text-gray-500 text-center py-4 md:py-6 text-xs md:text-sm">
        © 2025 MilkPOP Calendar. All rights reserved.
      </footer>
    </div>
  );
}
