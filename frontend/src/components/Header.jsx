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
        });
    }
  }, [location]);

  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <header className="banner">
      {/* 👇 ロゴをトップページへのリンクに変更 */}
      <h1 className="logo">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          MilkPOP Calendar
        </Link>
      </h1>

      {/* ハンバーガー */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="メニュー"
      >
        ☰
      </button>

      <nav className={`nav ${menuOpen ? "open" : ""}`}>
        <Link to="/register" onClick={() => setMenuOpen(false)}>
          日程登録
        </Link>
        <Link to="/personal" onClick={() => setMenuOpen(false)}>
          個人スケジュール
        </Link>
        {user ? (
          <span className="user-info">
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
              alt="avatar"
              className="avatar"
            />
            {user.username}
          </span>
        ) : (
          <button className="login-btn" onClick={handleLogin}>
            Discordでログイン
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
