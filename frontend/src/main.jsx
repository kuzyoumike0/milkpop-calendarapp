import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from './pages/App'
import Shared from './pages/Shared'
import MySchedule from './pages/MySchedule'
import ShareLink from './pages/ShareLink'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <nav className="p-4 bg-white shadow flex gap-4">
      <Link to="/">トップ</Link>
      <Link to="/shared">共有カレンダー</Link>
      <Link to="/myschedule">個人スケジュール</Link>
    </nav>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/shared" element={<Shared />} />
      <Route path="/myschedule" element={<MySchedule />} />
      <Route path="/share/:id" element={<ShareLink />} />
    </Routes>
  </BrowserRouter>
)