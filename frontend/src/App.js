import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Calendar from './components/calendar';

export default function App() {
  return (
    <Router>
      <div className="nav">
        <Link to="/">共有カレンダー</Link>
        <Link to="/personal">個人カレンダー</Link>
      </div>
      <Routes>
        <Route path="/" element={<Calendar type="shared" />} />
        <Route path="/personal" element={<Calendar type="personal" />} />
      </Routes>
    </Router>
  );
}
