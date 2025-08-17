import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PersonalSchedule from "./pages/PersonalSchedule";
import SharedCalendar from "./pages/SharedCalendar";
import SharedLink from "./pages/SharedLink";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl p-6">
        <nav className="flex gap-6 mb-6">
          <Link to="/" className="font-bold">個人スケジュール</Link>
          <Link to="/shared" className="font-bold">共有カレンダー</Link>
          <Link to="/link" className="font-bold">共有リンク</Link>
        </nav>
        <Routes>
          <Route path="/" element={<PersonalSchedule />} />
          <Route path="/shared" element={<SharedCalendar />} />
          <Route path="/link" element={<SharedLink />} />
        </Routes>
      </div>
    </Router>
  );
}
