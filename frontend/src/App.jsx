import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import CalendarPage from './CalendarPage';
import SharedPage from './SharedPage';

export default function App() {
  return (
    <div className="backdrop-blur-lg bg-white/30 shadow-xl rounded-lg p-6 m-4">
      <nav className="flex gap-4 mb-4 text-blue-700 font-semibold">
        <Link to="/">個人スケジュール</Link>
        <Link to="/shared">共有スケジュール</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/shared" element={<SharedPage />} />
      </Routes>
    </div>
  );
}