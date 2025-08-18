import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <section className="glass p-8">
      <h1 className="text-3xl font-bold text-accent">トップ</h1>
      <p className="text-textSub mt-2">共有作成と個人スケジュール作成に遷移できます。</p>
      <div className="mt-6 flex gap-4">
        <Link to="/shared" className="px-5 py-3 rounded-lg bg-accent text-[#121212] font-bold hover:bg-accentSub transition">共有カレンダーを作成</Link>
        <Link to="/personal" className="px-5 py-3 rounded-lg border border-white/10 hover:border-accentSub transition">個人スケジュールへ</Link>
      </div>
    </section>
  )
}
