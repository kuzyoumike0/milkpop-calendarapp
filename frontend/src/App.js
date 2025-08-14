import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SharedCalendar from './SharedCalendar';
import PersonalCalendar from './PersonalCalendar';

export default function App() {
  return (
    <Router>
      <nav style={{textAlign:'center', margin:'20px'}}>
        <Link to="/" style={{marginRight:'10px'}}>共有カレンダー</Link>
        <Link to="/personal">個人カレンダー</Link>
      </nav>
      <Routes>
        <Route path="/" element={<SharedCalendar />} />
        <Route path="/personal" element={<PersonalCalendar />} />
      </Routes>
    </Router>
  );
}
