import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="backdrop-blur-lg bg-white/40 rounded-2xl shadow-lg p-10 text-center">
      <h1 className="text-3xl font-bold mb-4">📅 カレンダーアプリ</h1>
      <p className="mb-6">共有カレンダーと個人スケジュールを管理できます。</p>
      <div className="flex justify-center gap-4">
        <Link to="/setup" className="px-4 py-2 bg-blue-500 text-white rounded-xl">共有設定</Link>
        <Link to="/personal" className="px-4 py-2 bg-green-500 text-white rounded-xl">個人スケジュール</Link>
      </div>
    </div>
  );
}
