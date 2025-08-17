import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./pages/TopPage";
import PersonalSchedulePage from "./pages/PersonalSchedulePage";
import SharedSchedulePage from "./pages/SharedSchedulePage";
import SharedLinkPage from "./pages/SharedLinkPage";

function App() {
  return (
    <Router>
      <header className="bg-dark text-primary px-6 py-4 text-2xl font-bold border-b border-secondary">
        MilkpopCalendar
        <nav className="mt-2 text-sm">
          <Link to="/" className="mr-4 hover:text-secondary">トップ</Link>
          <Link to="/personal" className="mr-4 hover:text-secondary">個人スケジュール</Link>
          <Link to="/shared" className="hover:text-secondary">共有スケジュール</Link>
        </nav>
      </header>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/personal" element={<PersonalSchedulePage />} />
          <Route path="/shared" element={<SharedSchedulePage />} />
          <Route path="/shared/:shareId" element={<SharedLinkPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
