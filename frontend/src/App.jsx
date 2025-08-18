import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import SharePage from "./components/SharePage";
import SharedLink from "./components/SharedLink";
import PersonalPage from "./components/PersonalPage";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ marginRight: "10px" }}>🏠 トップ</Link>
        <Link to="/shared" style={{ marginRight: "10px" }}>📅 共有カレンダー</Link>
        <Link to="/personal">👤 個人スケジュール</Link>
      </nav>

      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/shared" element={<SharePage />} />
        <Route path="/shared/:linkId" element={<SharedLink />} />
        <Route path="/personal" element={<PersonalPage />} />
      </Routes>
    </Router>
  );
}
