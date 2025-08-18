import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import CalendarView from "./CalendarView";
import PersonalPage from "./PersonalPage";
import SharePage from "./SharePage";
import "./styles.css";

export default function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">📅 お洒落カレンダー</h1>
        <nav className="nav">
          <Link to="/">トップ</Link>
          <Link to="/personal">個人スケジュール</Link>
          <Link to="/share">共有スケジュール</Link>
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<CalendarView />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/share/:id" element={<SharePage />} />
        </Routes>
      </main>
    </div>
  );
}
