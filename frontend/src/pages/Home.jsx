import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 backdrop-blur-lg bg-opacity-60">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">📅 カレンダーアプリ</h1>
      <div className="flex gap-4">
        <Link to="/personal" className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md">個人スケジュール</Link>
        <Link to="/shared" className="px-6 py-3 bg-green-500 text-white rounded-xl shadow-md">共有カレンダー</Link>
        <Link to="/share" className="px-6 py-3 bg-purple-500 text-white rounded-xl shadow-md">共有リンク</Link>
      </div>
    </div>
  );
}
