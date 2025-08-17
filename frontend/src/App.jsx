
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import PersonalSchedule from "./pages/PersonalSchedule";
import SharedSchedule from "./pages/SharedSchedule";

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="navbar-glass sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <div className="text-2xl font-extrabold text-primary tracking-wide">MilkpopCalendar</div>
          <nav className="ml-auto flex gap-4 text-sm">
            <Link to="/" className="hover:text-primary">トップ</Link>
            <Link to="/personal" className="hover:text-primary">個人スケジュール</Link>
            <Link to="/shared" className="hover:text-primary">共有スケジュール</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/personal" element={<PersonalSchedule />} />
          <Route path="/shared" element={<SharedSchedule />} />
        </Routes>
      </main>
    </div>
  );
}
