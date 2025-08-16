import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Personal from './pages/Personal.jsx';
import Shared from './pages/Shared.jsx';
import Events from './pages/Events.jsx';

export default function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>MilkPop Calendar</h1>
        <nav className="nav">
          <NavLink to="/personal" className="link">個人スケジュール</NavLink>
          <NavLink to="/shared" className="link">共有スケジュール</NavLink>
          <NavLink to="/events" className="link">イベント一覧</NavLink>
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/personal" replace />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/shared" element={<Shared />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </main>

      <footer className="footer">
        <small>© 2025 MilkPop</small>
      </footer>
    </div>
  );
}
