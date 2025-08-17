import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="glass p-8">
      <h1 className="text-3xl font-bold mb-2 text-primary">ようこそ 👋</h1>
      <p className="text-white/80 mb-6">グラスモーフィズムUIのカレンダー。祝日表示と黒文字の読みやすい日付。</p>
      <div className="flex gap-3 flex-wrap">
        <Link to="/shared" className="px-4 py-2 rounded-xl font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-md">共有スケジュール</Link>
        <Link to="/personal" className="px-4 py-2 rounded-xl font-semibold bg-white text-black">個人スケジュール</Link>
      </div>
    </div>
  )
}
