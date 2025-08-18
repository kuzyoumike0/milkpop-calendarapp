import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="bg-white/70 backdrop-blur-lg min-h-screen p-6">
      <nav className="flex gap-4 mb-6 text-accentBlue font-bold">
        <Link to="/">トップ</Link>
        <Link to="/shared">共有カレンダー</Link>
        <Link to="/link">共有リンク</Link>
        <Link to="/personal">個人スケジュール</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h1 className="text-3xl text-accentPink">トップ画面</h1>} />
        <Route path="/shared" element={<h1>共有カレンダー画面</h1>} />
        <Route path="/link" element={<h1>共有リンク画面</h1>} />
        <Route path="/personal" element={<h1>個人スケジュール画面</h1>} />
      </Routes>
    </div>
  );
}
