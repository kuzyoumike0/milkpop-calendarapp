import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function TopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0d0d0d] to-[#1a1a1a] flex flex-col items-center justify-center px-4">
      {/* バナー */}
      <header className="w-full text-center py-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide drop-shadow-lg">
          MilkPOP Calendar
        </h1>
      </header>

      {/* カードコンテナ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mt-8">
        {/* 日程登録ページカード */}
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-2xl p-8 backdrop-blur-md bg-white/10 border border-white/20 shadow-lg flex flex-col items-center justify-center text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">日程登録ページ</h2>
          <p className="text-gray-300 mb-6">
            複数日程や範囲を選んで、共有リンクを発行できます。
          </p>
          <Link
            to="/link"
            className="px-6 py-3 rounded-xl bg-[#FDB9C8] hover:bg-[#eaa1b0] text-black font-semibold shadow-md transition"
          >
            開く
          </Link>
        </motion.div>

        {/* 個人スケジュールページカード */}
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-2xl p-8 backdrop-blur-md bg-white/10 border border-white/20 shadow-lg flex flex-col items-center justify-center text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">個人スケジュールページ</h2>
          <p className="text-gray-300 mb-6">
            メモや時間帯を指定して、自分用スケジュールを登録できます。
          </p>
          <Link
            to="/personal"
            className="px-6 py-3 rounded-xl bg-[#004CA0] hover:bg-[#003680] text-white font-semibold shadow-md transition"
          >
            開く
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
