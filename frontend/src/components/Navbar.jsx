import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar(){
  const { pathname } = useLocation()
  const isActive = (p)=> pathname===p ? "text-accent" : "text-text"
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#121212]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
        <div className="text-2xl font-extrabold tracking-tight text-accent">MilkpopCalendar</div>
        <nav className="flex gap-6 text-sm">
          <Link className={`hover:text-accentSub transition ${isActive('/')}`} to="/">トップ</Link>
          <Link className={`hover:text-accentSub transition ${isActive('/shared')}`} to="/shared">共有カレンダー</Link>
          <Link className={`hover:text-accentSub transition ${isActive('/personal')}`} to="/personal">個人スケジュール</Link>
        </nav>
      </div>
    </header>
  )
}
