import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import RegisterPage from "./components/RegisterPage";
import SharePage from "./components/SharePage";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", background: "#eee" }}>
        <Link to="/">トップ</Link> |{" "}
        <Link to="/register">日程登録</Link> |{" "}
        <Link to="/personal">個人日程登録</Link>
      </nav>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share/:linkid" element={<SharePage />} />
      </Routes>
    </Router>
  );
}
