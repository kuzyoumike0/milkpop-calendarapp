import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TopPage from './pages/TopPage';
import SharedPage from './pages/SharedPage';
import PersonalPage from './pages/PersonalPage';

export default function App() {
  return (
    <Router>
      <header className="banner">MilkpopCalendar</header>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/shared" element={<SharedPage />} />
        <Route path="/personal" element={<PersonalPage />} />
      </Routes>
    </Router>
  );
}
