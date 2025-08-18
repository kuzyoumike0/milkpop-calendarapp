import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import SharedCalendar from "./pages/SharedCalendar";
import SharedLink from "./pages/SharedLink";
import PersonalSchedule from "./pages/PersonalSchedule";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ marginRight: "10px" }}>🏠 トップ</Link>
        <Link to="/shared" style={{ marginRight: "10px" }}>📅 共有カレンダー</Link>
        <Link to="/personal">👤 個人スケジュール</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shared" element={<SharedCalendar />} />
        <Route path="/shared/:linkId" element={<SharedLink />} />
        <Route path="/personal" element={<PersonalSchedule />} />
      </Routes>
    </Router>
  );
}
