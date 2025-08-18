import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CalendarPage from "./components/CalendarPage";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", background: "#f0f0f0" }}>
        <Link to="/">トップ</Link> | <Link to="/shared">共有カレンダー</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h2>✅ トップページ</h2>} />
        <Route path="/shared" element={<CalendarPage />} />
      </Routes>
    </Router>
  );
}
