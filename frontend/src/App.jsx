import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import CalendarPage from "./components/CalendarPage";

export default function App() {
  return (
    <div>
      <h1>共有カレンダー</h1>
      <nav>
        <Link to="/">ホーム</Link> | <Link to="/calendar">カレンダー</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div>トップページです</div>} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </div>
  );
}
