import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import SharedCalendar from './pages/SharedCalendar';
import ShareLink from './pages/ShareLink';
import PersonalSchedule from './pages/PersonalSchedule';

export default function App() {
  return (
    <div className="backdrop-blur-md bg-white/50 shadow-lg rounded-xl p-6 m-4">
      <nav className="flex gap-4 mb-6">
        <Link to="/" className="text-blue-600 font-bold">🏠 Home</Link>
        <Link to="/calendar" className="text-blue-600 font-bold">📅 Shared Calendar</Link>
        <Link to="/share" className="text-blue-600 font-bold">🔗 Share Link</Link>
        <Link to="/personal" className="text-blue-600 font-bold">📝 Personal</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<SharedCalendar />} />
        <Route path="/share/:id?" element={<ShareLink />} />
        <Route path="/personal" element={<PersonalSchedule />} />
      </Routes>
    </div>
  );
}
