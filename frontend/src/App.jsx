import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import CalendarView from "./components/CalendarView";
import EventForm from "./components/EventForm";

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">カレンダー</Link> | <Link to="/new">予定追加</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CalendarView />} />
        <Route path="/new" element={<EventForm />} />
      </Routes>
    </div>
  );
}