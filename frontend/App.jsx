import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PersonalSchedule from './pages/PersonalSchedule.jsx';
import SharedSchedule from './pages/SharedSchedule.jsx';
import EventCalendar from './pages/EventCalendar.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-200">
        <Link className="mr-4" to="/personal">個人スケジュール</Link>
        <Link className="mr-4" to="/shared">共有スケジュール</Link>
        <Link to="/calendar">イベント表示</Link>
      </nav>
      <Routes>
        <Route path="/personal" element={<PersonalSchedule />} />
        <Route path="/shared" element={<SharedSchedule />} />
        <Route path="/calendar" element={<EventCalendar />} />
      </Routes>
    </BrowserRouter>
  );
}
