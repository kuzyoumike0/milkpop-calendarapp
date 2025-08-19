import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import LinkPage from "./components/LinkPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

const Navbar = () => (
  <div style={{ background: "#004CA0", padding: "10px", color: "white" }}>
    <h1 style={{ display: "inline", marginRight: "20px", color: "#FDB9C8" }}>MilkPOP Calendar</h1>
    <Link to="/" style={{ marginRight: "15px", color: "white" }}>トップ</Link>
    <Link to="/register" style={{ marginRight: "15px", color: "white" }}>日程登録</Link>
    <Link to="/personal" style={{ marginRight: "15px", color: "white" }}>個人日程</Link>
  </div>
);

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/register" element={<LinkPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share/:linkid" element={<SharePage />} />
        <Route path="/links" element={<ShareLinkPage />} />
      </Routes>
    </Router>
  );
}
