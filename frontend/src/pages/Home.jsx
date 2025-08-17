
import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="glass p-8">
      <h1 className="text-3xl font-bold mb-2 text-primary">ようこそ 👋</h1>
      <p className="text-white/80 mb-6">高級感あるグラスモーフィズムUIでスケジュールを共有しましょう。</p>
      <div className="flex gap-3 flex-wrap">
        <Link to="/shared" className="btn-primary">共有スケジュールを作成</Link>
        <Link to="/personal" className="btn-ghost">個人スケジュール</Link>
      </div>
    </div>
  )
}
