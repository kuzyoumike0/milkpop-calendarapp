import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function TopPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      {/* タイトル */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-extrabold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-center"
      >
        MilkPOP Calendar
      </motion.h1>

      {/* カードリンク */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* 日程登録ページ */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6 w-72 text-center"
        >
          <h2 className="text-2xl font-semibold mb-4">日程登録ページ</h2>
          <p className="mb-6 text-sm text-gray-300">
            新しいイベントを登録して、共有リンクを発行できます。
          </p>
          <Link
            to="/link"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#004CA0] to-[#FDB9C8] text-white font-bold shadow-md"
          >
            開く
          </Link>
        </motion.div>

        {/* 個人スケジュールページ */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6 w-72 text-center"
        >
          <h2 className="text-2xl font-semibold mb-4">個人スケジュール</h2>
          <p className="mb-6 text-sm text-gray-300">
            あなたの予定を登録して、いつでも確認できます。
          </p>
          <Link
            to="/personal"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] text-white font-bold shadow-md"
          >
            開く
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
