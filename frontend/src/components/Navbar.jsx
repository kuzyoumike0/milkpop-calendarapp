import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="backdrop-blur-lg bg-white/30 shadow-md rounded-xl flex gap-4 p-4 mb-6">
      <Link to="/">共有カレンダー</Link>
      <Link to="/personal">個人スケジュール</Link>
    </nav>
  )
}

export default Navbar
