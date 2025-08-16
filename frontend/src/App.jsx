import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Personal from './pages/Personal.jsx';
import Shared from './pages/Shared.jsx';
import Events from './pages/Events.jsx';

export default function App() {
  const [me, setMe] = useState(null);

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setMe(data);
      }
    } catch {}
  };

  useEffect(() => { fetchMe(); }, []);

  const logout = async () => {
    await fetch('/auth/logout');
    setMe(null);
    window.location.href = '/';
  };

  return (
    <div className="container">
      <header className="header">
        <h1>MilkPop Calendar</h1>
        <nav className="nav">
          <NavLink to="/personal" className="link">個人スケジュール</NavLink>
          <NavLink to="/shared" className="link">共有スケジュール</NavLink>
          <NavLink to="/events" className="link">イベント一覧</NavLink>
        </nav>
        <div>
          {me?.loggedIn ? (
            <>
              <span style={{marginRight:12}}>👤 {me.email}</span>
              <button className="button" onClick={logout}>ログアウト</button>
            </>
          ) : (
            <a className="button" href="/auth/google/login">Googleでログイン</a>
          )}
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/personal" replace />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/shared" element={<Shared embedUrl={import.meta.env.VITE_GOOGLE_CALENDAR_EMBED_URL} />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </main>

      <footer className="footer">
        <small>© 2025 MilkPop</small>
      </footer>
    </div>
  );
}
