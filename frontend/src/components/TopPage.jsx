// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function TopPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col text-white">
      {/* 背景（グラデーション + 粒子風） */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a1a] to-[#1a1a1a]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#004CA0_0%,transparent_40%),radial-gradient(circle_at_bottom_right,#FDB9C8_0%,transparent_40%)] opacity-40" />
      </div>

      {/* バナー */}
      <header className="bg-black/40 backdrop-blur-md border-b border-white/10 fixed top-0 left-0 right-0 z-50">
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
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 relative z-10">
        <h2 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] bg-clip-text text-transparent drop-shadow-lg">
          スケジュールをもっとスマートに
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mb-12 leading-relaxed">
          MilkPOP Calendar で予定を登録し、仲間とシェア。  
          シンプルで美しいカレンダー体験を。
        </p>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl w-full">
          {/* 日程登録カード */}
          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ type: "spring", stiffness: 250 }}
          >
            <Link
              to="/link"
              className="block rounded-2xl p-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl hover:border-[#FDB9C8]/60 transition"
            >
              <h3 className="text-2xl font-semibold text-[#FDB9C8] mb-4">
                日程登録ページ
              </h3>
              <p className="text-gray-200 leading-relaxed">
                カレンダーUIで複数日や範囲を選択して共有リンクを発行。  
                仲間と予定を簡単にシェアできます。
              </p>
            </Link>
          </motion.div>

          {/* 個人スケジュールカード */}
          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ type: "spring", stiffness: 250 }}
          >
            <Link
              to="/personal"
              className="block rounded-2xl p-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl hover:border-[#004CA0]/60 transition"
            >
              <h3 className="text-2xl font-semibold text-[#004CA0] mb-4">
                個人スケジュール登録ページ
              </h3>
              <p className="text-gray-200 leading-relaxed">
                タイトル・メモ・時間帯を登録して、  
                あなた専用のカレンダーを作りましょう。
              </p>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-black/40 backdrop-blur-md text-gray-400 text-center py-6 text-sm border-t border-white/10 relative z-10">
        © 2025 MilkPOP Calendar. All rights reserved.
      </footer>
    </div>
  );
}
