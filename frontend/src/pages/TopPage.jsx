import React from 'react'
import { Link } from 'react-router-dom'

export default function TopPage(){
  return (
    <div className="card">
      <h1 className="text-3xl font-bold mb-2 text-[var(--pink)]">ようこそ 👋</h1>
      <p className="opacity-80 mb-4">高級感のあるポップデザインのスケジュール共有ツールです。</p>
      <div className="flex gap-3 flex-wrap">
        <Link to="/shared" className="brand-btn">共有スケジュールを作成</Link>
        <Link to="/personal" className="brand-btn" style={{background:'linear-gradient(90deg,#d26d8c,var(--pink))',color:'#111'}}>個人スケジュール</Link>
      </div>
    </div>
  )
}
