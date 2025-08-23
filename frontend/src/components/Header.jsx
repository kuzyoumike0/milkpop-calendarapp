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
    <header className="banner relative px-4 py-2 bg-black text-white shadow-md">
      <div className="flex justify-between items-center">
        {/* 左側：ロゴ */}
        <h1 className="logo text-2xl font-bold">
          <Link to="/">MilkPOP Calendar</Link>
        </h1>

        {/* 右側：PC表示時のナビゲーション */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link to="/register">日程登録</Link>
          <Link to="/personal">個人スケジュール</Link>
          {user ? (
            <span className="user-info flex items-center gap-2">
              <img
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                alt="avatar"
                className="avatar w-8 h-8 rounded-full"
              />
              <span>{user.username}</span>
              <button
                className="logout-btn ml-2 px-2 py-1 bg-red-500 text-white rounded"
                onClick={handleLogout}
              >
                ログアウト
              </button>
            </span>
          ) : (
            <button
              className="login-btn bg-[#5865F2] text-white px-3 py-1 rounded hover:bg-[#4752C4]"
              onClick={handleLogin}
            >
              Discordでログイン
            </button>
          )}
        </nav>

        {/* モバイル用 ☰ ボタン */}
        <button
          className="hamburger text-2xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          ☰
        </button>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col items-end gap-3 mt-3 bg-gray-900 text-white rounded p-4">
          <Link to="/register" onClick={() => setMenuOpen(false)}>
            日程登録
          </Link>
          <Link to="/personal" onClick={() => setMenuOpen(false)}>
            個人スケジュール
          </Link>
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="text-red-400"
            >
              ログアウト
            </button>
          ) : (
            <button
              onClick={() => {
                handleLogin();
                setMenuOpen(false);
              }}
              className="bg-[#5865F2] px-3 py-1 rounded"
            >
              Discordでログイン
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
