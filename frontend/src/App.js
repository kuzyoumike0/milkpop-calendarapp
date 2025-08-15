import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SharedCalendar from "./pages/SharedCalendar";
import PersonalCalendar from "./pages/PersonalCalendar";
import "./App.css"; // Tailwind を使う場合は import だけでOK

export default function App() {
  return (
    <Router>
      <nav className="text-center my-6">
        <Link to="/" className="mx-4 text-indigo-600 font-semibold hover:underline">共有カレンダー</Link>
        <Link to="/personal" className="mx-4 text-indigo-600 font-semibold hover:underline">個人カレンダー</Link>
      </nav>
      <Routes>
        <Route path="/" element={<SharedCalendar />} />
        <Route path="/personal" element={<PersonalCalendar />} />
      </Routes>
    </Router>
  );
}
