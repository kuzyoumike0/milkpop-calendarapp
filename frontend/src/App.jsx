import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CalendarView from './components/CalendarView'
import SharedLinkView from './components/SharedLinkView'
import PersonalScheduleView from './components/PersonalScheduleView'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/" element={<CalendarView />} />
          <Route path="/shared/:linkId" element={<SharedLinkView />} />
          <Route path="/personal" element={<PersonalScheduleView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
