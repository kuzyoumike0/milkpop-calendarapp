import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import TopPage from './pages/TopPage.jsx'
import PersonalSchedulePage from './pages/PersonalSchedulePage.jsx'
import SharedSchedulePage from './pages/SharedSchedulePage.jsx'

export default function App() {
  return (
    <Router>
      <div className="navbar">
        <h1>MilkpopCalendar</h1>
        <nav>
          <Link to="/">トップ</Link>
          <Link to="/personal">個人スケジュール</Link>
          <Link to="/shared">共有スケジュール</Link>
        </nav>
      </div>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/personal" element={<PersonalSchedulePage />} />
        <Route path="/shared" element={<SharedSchedulePage />} />
      </Routes>
    </Router>
  )
}
