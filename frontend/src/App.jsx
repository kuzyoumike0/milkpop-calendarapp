import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Personal from './pages/Personal'
import Shared from './pages/Shared'
import SharedLink from './pages/SharedLink'

export default function App() {
  return (
    <div style={{padding: "20px", fontFamily: "sans-serif"}}>
      <nav style={{marginBottom: "20px"}}>
        <Link to="/">🏠 トップ</Link> |{" "}
        <Link to="/personal">📅 個人スケジュール</Link> |{" "}
        <Link to="/shared">🌍 共有カレンダー</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/personal" element={<Personal />} />
        <Route path="/shared" element={<Shared />} />
        <Route path="/shared/:id" element={<SharedLink />} />
      </Routes>
    </div>
  )
}
