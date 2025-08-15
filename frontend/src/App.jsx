// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SharedCalendar from "./pages/SharedCalendar";
import PersonalCalendar from "./pages/PersonalCalendar";

export default function App() {
  return (
    <Router>
      <nav className="text-center my-6 space-x-6">
        <Link to="/" className="text-indigo-600 font-semibold hover:underline">共有カレンダー</Link>
        <Link to="/personal" className="text-indigo-600 font-semibold hover:underline">個人カレンダー</Link>
      </nav>

      <Routes>
        <Route path="/" element={<SharedCalendar />} />
        <Route path="/personal" element={<PersonalCalendar />} />
      </Routes>
    </Router>
  );
}
