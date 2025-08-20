import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function TopPage() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="flex flex-col items-center justify-center text-white w-full max-w-5xl">
        {/* タイトル */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-center drop-shadow-lg"
        >
          MilkPOP Calendar
        </motion.h1>

        {/* カードリンクエリア */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* 日程登録ページカード */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.97 }}
            className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-80 text-center transition-transform duration-300"
          >
            <h2 className="text-2xl font-semibold mb-4">日程登録ページ</h2>
            <p className="mb-6 text-sm text-gray-300 leading-relaxed">
              新しいイベントを登録して、共有リンクを発行できます。
            </p>
            <Link
              to="/link"
              className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-[#004CA0] to-[#FDB9C8] text-white font-bold shadow-md hover:opacity-90 transition"
            >
              開く
            </Link>
          </motion.div>

          {/* 個人スケジュールページカード */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: -1 }}
            whileTap={{ scale: 0.97 }}
            className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-80 text-center transition-transform duration-300"
          >
            <h2 className="text-2xl font-semibold mb-4">個人スケジュール</h2>
            <p className="mb-6 text-sm text-gray-300 leading-relaxed">
              あなたの予定を登録して、いつでも確認できます。
            </p>
            <Link
              to="/personal"
              className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-white font-bold shadow-md hover:opacity-90 transition"
            >
              開く
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
