import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PersonalSchedule from './pages/PersonalSchedule';
import SharedSchedule from './pages/SharedSchedule';
import EventList from './pages/EventList';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-6">
        <nav className="flex justify-center gap-6 mb-8 text-white font-bold">
          <Link to="/personal" className="hover:underline">個人スケジュール</Link>
          <Link to="/shared" className="hover:underline">共有スケジュール</Link>
          <Link to="/events" className="hover:underline">イベント一覧</Link>
        </nav>
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6">
          <Routes>
            <Route path="/personal" element={<PersonalSchedule />} />
            <Route path="/shared" element={<SharedSchedule />} />
            <Route path="/events" element={<EventList />} />
            <Route path="*" element={<PersonalSchedule />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
