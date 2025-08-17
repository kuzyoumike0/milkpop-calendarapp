import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import CalendarPage from './pages/CalendarPage';
import SharePage from './pages/SharePage';
import PersonalPage from './pages/PersonalPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <nav className="p-4 bg-white shadow flex gap-4">
        <Link to="/">🏠 トップ</Link>
        <Link to="/share">🔗 共有設定</Link>
        <Link to="/personal">👤 個人スケジュール</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/personal" element={<PersonalPage />} />
      </Routes>
    </div>
  );
}
