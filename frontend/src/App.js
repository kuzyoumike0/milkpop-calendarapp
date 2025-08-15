import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SharedCalendar from "./pages/SharedCalendar";
import PersonalCalendar from "./pages/PersonalCalendar";

export default function App() {
  return (
    <Router>
      <nav style={{ textAlign: "center", margin: "20px" }}>
        <Link to="/" style={{ marginRight: "20px" }}>共有カレンダー</Link>
        <Link to="/personal">個人カレンダー</Link>
      </nav>

      <Routes>
        <Route path="/" element={<SharedCalendar />} />
        <Route path="/personal" element={<PersonalCalendar />} />
      </Routes>
    </Router>
  );
}
