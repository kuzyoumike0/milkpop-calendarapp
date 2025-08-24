import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      <Link to="/" className="logo-link">MilkPOP Calendar</Link>

      <nav className="nav-links">
        <Link to="/personal">個人スケジュール</Link>
        <Link to="/register">日程登録</Link>
        <a href="/auth/discord" className="discord-login">Discordログイン</a>
      </nav>

      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {isOpen && (
        <nav className="nav-links-mobile">
          <Link to="/personal" onClick={() => setIsOpen(false)}>個人スケジュール</Link>
          <Link to="/register" onClick={() => setIsOpen(false)}>日程登録</Link>
          <a href="/auth/discord" className="discord-login" onClick={() => setIsOpen(false)}>Discordログイン</a>
        </nav>
      )}
    </header>
  );
}
