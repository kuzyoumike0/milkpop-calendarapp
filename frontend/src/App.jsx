import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CalendarView from "./CalendarView";
import SharePage from "./SharePage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CalendarView />} />
        <Route path="/share/:shareId" element={<SharePage />} />
      </Routes>
    </Router>
  );
}
