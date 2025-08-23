import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../index.css";

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // OAuthリダイレクト後に sessionId を保存
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session");
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId);
      window.history.replaceState({}, document.title, location.pathname);
    }

    // 保存済みセッションからユーザー取得
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
    <header className="banner flex justify-between items-center px-4 py-2">
      {/* 左側：ロゴ */}
      <h1 className="logo text-2xl font-bold">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          MilkPOP Calendar
        </Link>
      </h1>

      {/* 右側：ナビゲーション + ハンバーガー */}
      <div className="flex items-center gap-4">
        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <Link to="/register" onClick={() => setMenuOpen(false)}>
            日程登録
          </Link>
          <Link to="/personal" onClick={() => setMenuOpen(false)}>
            個人スケジュール
          </Link>

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

        {/* 👇 ハンバーガーメニューを右端に配置 */}
        <button
          className="hamburger text-2xl"
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
