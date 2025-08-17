import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Shared from "./pages/Shared";
import SharedLink from "./pages/SharedLink";
import Personal from "./pages/Personal";

export default function App() {
  return (
    <div className="p-4">
      <header className="glass px-6 py-4 mb-6 flex items-center gap-6">
        <div className="text-2xl font-extrabold">MilkpopCalendar</div>
        <nav className="flex gap-4">
          <Link className="nav-link" to="/">トップ</Link>
          <Link className="nav-link" to="/personal">個人スケジュール</Link>
          <Link className="nav-link" to="/shared">共有カレンダー</Link>
        </nav>
      </header>
      <main className="glass p-6">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/shared" element={<Shared/>}/>
          <Route path="/share/:id" element={<SharedLink/>}/>
          <Route path="/personal" element={<Personal/>}/>
        </Routes>
      </main>
    </div>
  );
}
