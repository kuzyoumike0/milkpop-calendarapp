import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SharedCalendar from './components/SharedCalendar';
import PersonalCalendar from './components/PersonalCalendar';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="nav">
        <Link to="/">共有カレンダー</Link>
        <Link to="/personal">個人カレンダー</Link>
      </div>

      <Routes>
        <Route path="/" element={<SharedCalendar />} />
        <Route path="/personal" element={<PersonalCalendar />} />
      </Routes>
    </Router>
  );
}
