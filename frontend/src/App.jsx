import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import PersonalSchedule from "./pages/PersonalSchedule";
import SharedCalendar from "./pages/SharedCalendar";
import SharedLink from "./pages/SharedLink";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 bg-opacity-80 backdrop-blur-md">
      <nav className="flex gap-4 p-4 bg-white bg-opacity-40 shadow-md">
        <Link to="/">🏠 ホーム</Link>
        <Link to="/personal">📅 個人スケジュール</Link>
        <Link to="/shared">🤝 共有カレンダー</Link>
      </nav>
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/personal" element={<PersonalSchedule />} />
          <Route path="/shared" element={<SharedCalendar />} />
          <Route path="/shared/:id" element={<SharedLink />} />
        </Routes>
      </div>
    </div>
  );
}
