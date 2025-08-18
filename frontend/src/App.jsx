import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", background: "#eee" }}>
        <Link to="/">トップ</Link> | <Link to="/personal">個人</Link> |{" "}
        <Link to="/share">共有</Link>
      </nav>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share" element={<SharePage />} />
      </Routes>
    </Router>
  );
}
