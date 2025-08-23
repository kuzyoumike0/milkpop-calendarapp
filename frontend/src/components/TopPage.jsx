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
    <header>
      {/* 左端ロゴ */}
      <div className="logo ml-4 text-2xl font-bold">
        <Link to="/">MilkPOP Calendar</Link>
      </div>

      {/* 右端リンク群 */}
      <div className="flex items-center gap-4 mr-4">
        <nav className="nav flex gap-6 items-center">
          <Link to="/register">日程登録</Link>
          <Link to="/personal">個人スケジュール</Link>
        </nav>

        {user ? (
          <div className="flex items-center gap-2">
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <span>{user.username}</span>
            <button
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
              onClick={handleLogout}
            >
              ログアウト
            </button>
          </div>
        ) : (
          <button
            className="bg-[#5865F2] text-white px-3 py-1 rounded hover:bg-[#4752C4]"
            onClick={handleLogin}
          >
            Discordでログイン
          </button>
        )}

        {/* モバイル用 ☰ */}
        <button
          className="hamburger text-2xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;
