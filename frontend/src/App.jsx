import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import TopPage from './pages/TopPage'
import PersonalPage from './pages/PersonalPage'
import SharedPage from './pages/SharedPage'
import SharedLinkPage from './pages/SharedLinkPage'

export default function App(){
  return (
    <>
      <header className="sticky top-0 z-10 bg-gradient-to-r from-brandBlue to-black border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="text-2xl font-bold text-[var(--pink)]">MilkpopCalendar</div>
          <nav className="ml-auto flex gap-4 text-sm">
            <Link to="/" className="hover:text-[var(--pink)]">トップ</Link>
            <Link to="/personal" className="hover:text-[var(--pink)]">個人スケジュール</Link>
            <Link to="/shared" className="hover:text-[var(--pink)]">共有スケジュール</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/shared" element={<SharedPage />} />
          <Route path="/shared/:id" element={<SharedLinkPage />} />
        </Routes>
      </main>
    </>
  )
}
