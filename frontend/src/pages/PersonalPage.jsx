import React, { useState } from 'react'

export default function PersonalPage(){
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4 text-[var(--pink)]">個人スケジュール</h2>
      <label className="block mb-2 text-sm opacity-80">タイトル</label>
      <input className="w-full rounded-lg px-3 py-2 text-black mb-4" value={title} onChange={e=>setTitle(e.target.value)} placeholder="タイトルを入力" />
      <label className="block mb-2 text-sm opacity-80">日付</label>
      <input type="date" className="w-full rounded-lg px-3 py-2 text-black" value={date} onChange={e=>setDate(e.target.value)} />
      <div className="mt-4 text-sm opacity-70">※ カレンダーUIは後で差し替え可能。現在はシンプルな入力版です。</div>
    </div>
  )
}
