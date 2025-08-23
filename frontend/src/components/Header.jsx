import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../index.css";

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session");
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId);
      window.history.replaceState({}, document.title, location.pathname);
    }

    const storedSession = localStorage.getItem("sessionId");
    if (storedSession) {
      fetch(`/api/me/${storedSession}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) setUser(data.user);
        })
        .catch(() => setUser(null));
    }
  }, [location]);

  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  const handleLogout = () => {
    localStorage.removeItem("sessionId");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="main-header">
      {/* 左端ロゴ */}
      <div className="logo text-2xl font-bold">
        <Link to="/">MilkPOP Calendar</Link>
      </div>

      {/* PC表示ナビ */}
      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/register">日程登録</Link>
        <Link to="/personal">個人スケジュール</Link>
        <Link to="/share">共有ページ</Link>

        {user ? (
          <div className="user-info">
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
              alt="avatar"
              className="avatar"
            />
            <span>{user.username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={handleLogin}>
            Discordでログイン
          </button>
        )}
      </nav>

      {/* ハンバーガーメニュー */}
      <button
        className={`hamburger ${menuOpen ? "active" : ""}`}
        aria-label="メニュー"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
};

export default Header;
