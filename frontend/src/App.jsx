import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import PersonalSchedule from "./pages/PersonalSchedule";
import SharedSchedule from "./pages/SharedSchedule";

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-elegantBlack text-primary p-4 text-xl font-bold">
        カレンダーアプリ
        <nav className="mt-2 space-x-4 text-white">
          <Link to="/">トップ</Link>
          <Link to="/personal">個人スケジュール</Link>
          <Link to="/shared">共有スケジュール</Link>
        </nav>
      </header>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/personal" element={<PersonalSchedule />} />
          <Route path="/shared" element={<SharedSchedule />} />
        </Routes>
      </main>
    </div>
  );
}
