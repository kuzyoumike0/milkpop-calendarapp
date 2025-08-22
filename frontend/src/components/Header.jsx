// frontend/src/components/Header.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../index.css";

const Header = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // URLパラメータからセッションIDを取得
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session");
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId);
      window.history.replaceState({}, document.title, location.pathname); // URLから削除
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
      <h1>MilkPOP Calendar</h1>
      <nav>
        <Link to="/share">日程登録</Link>
        <Link to="/personal">個人スケジュール</Link>
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
