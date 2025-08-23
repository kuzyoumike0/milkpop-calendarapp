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
        {/* 左端：ロゴ */}
        <h1 className="logo text-2xl font-bold">
          <Link to="/">MilkPOP Calendar</Link>
        </h1>

        {/* 右端：リンク + ユーザー情報 + ハンバーガー */}
        <div className="flex items-center gap-4 relative">
          {/* PC表示時のリンク */}
          <nav className="hidden md:flex gap-6">
            <Link to="/register">日程登録</Link>
            <Link to="/personal">個人スケジュール</Link>
          </nav>

          {/* ユーザー情報 / ログイン */}
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

          {/* ハンバーガー（モバイル用） */}
          <button
            className="hamburger text-2xl md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            ☰
          </button>

          {/* モバイル用メニュー（右端・縦並び） */}
          {menuOpen && (
            <nav className="absolute top-full right-0 mt-2 bg-gray-900 text-white rounded shadow-lg p-3 flex flex-col gap-2">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
