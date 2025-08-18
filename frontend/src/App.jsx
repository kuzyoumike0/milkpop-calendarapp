import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SharedCalendar from './pages/SharedCalendar'
import SharedLink from './pages/SharedLink'
import PersonalSchedule from './pages/PersonalSchedule'

export default function App(){
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main className="p-6 max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/shared" element={<SharedCalendar/>} />
          <Route path="/share/:id" element={<SharedLink/>} />
          <Route path="/personal" element={<PersonalSchedule/>} />
        </Routes>
      </main>
    </div>
  )
}
