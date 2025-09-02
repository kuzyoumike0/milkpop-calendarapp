// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import SharePage from "./components/SharePage";
import PersonalSharePage from "./components/PersonalSharePage";
import PersonalPage from "./components/PersonalPage";

import "./common.css";

function Header() {
  return (
    <header className="mp-header">
      <div className="mp-header__inner">
        <Link to="/" className="mp-brand">MilkPOP Calendar</Link>
        <nav className="mp-nav">
          <Link to="/personal" className="mp-nav__link">個人スケジュール</Link>
          <Link to="/register" className="mp-nav__link">日程登録</Link>
          <Link to="/share" className="mp-nav__link">共有一覧</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="mp-footer">© 2025 MilkPOP</footer>;
}

export default function App() {
  return (
    <Router>
      <div className="mp-app">
        <Header />
        <main className="mp-main">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/share" element={<SharePage />} />
            <Route path="/share/:token" element={<PersonalSharePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
