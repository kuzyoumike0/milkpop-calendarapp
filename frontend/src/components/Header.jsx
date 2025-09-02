// frontend/src/components/Header.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../common.css";

// ヘッダー（ログイン状態は /api/me で確認。ログアウト時は localStorage の互換JWTも確実に削除）
export default function Header({ user: userProp = null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(userProp);
  const [checking, setChecking] = useState(!userProp);

  useEffect(() => {
    if (userProp) return; // 親から渡された場合は確認不要
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (!cancelled && res.ok) {
          const data = await res.json().catch(() => null);
          setUser(data?.user ?? null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userProp]);

  const handleLogout = () => {
    try {
      // 互換用に残っている可能性があるJWTを必ず削除
      localStorage.removeItem("jwt");
    } catch {}
    // サーバ側でHttpOnly Cookieを消す
    window.location.href = "/auth/logout";
  };

  const loginHref = "/auth/discord";

  return (
    <header className="header">
      {/* 左側ロゴ */}
      <Link to="/" className="logo-link">
        MilkPOP Calendar
      </Link>

      {/* PC用ナビゲーション */}
      <nav className="nav-links">
        <Link to="/usage" className="nav-link">
          使い方
        </Link>
        <Link to="/register" className="nav-link">
          日程登録
        </Link>
        <Link to="/personal" className="nav-link">
          個人日程登録
        </Link>

        {checking ? (
          <span className="nav-muted">確認中…</span>
        ) : user ? (
          <>
            <span className="nav-user" title={user.username}>
              {user.username}
            </span>
            <button type="button" className="nav-btn" onClick={handleLogout}>
              ログアウト
            </button>
          </>
        ) : (
          <a href={loginHref} className="nav-btn">
            Discordログイン
          </a>
        )}
      </nav>

      {/* ハンバーガーメニュー（スマホ用） */}
      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="メニュー"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setMenuOpen((v) => !v);
        }}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* モバイルメニュー */}
      <div className={`nav-links-mobile ${menuOpen ? "open" : ""}`}>
        <Link
          to="/usage"
          className="nav-link-mobile"
          onClick={() => setMenuOpen(false)}
        >
          使い方
        </Link>
        <Link
          to="/register"
          className="nav-link-mobile"
          onClick={() => setMenuOpen(false)}
        >
          日程登録
        </Link>
        <Link
          to="/personal"
          className="nav-link-mobile"
          onClick={() => setMenuOpen(false)}
        >
          個人日程登録
        </Link>

        {checking ? (
          <span className="nav-muted-mobile">確認中…</span>
        ) : user ? (
          <button
            type="button"
            className="nav-btn-mobile"
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
          >
            ログアウト
          </button>
        ) : (
          <a
            href={loginHref}
            className="nav-btn-mobile"
            onClick={() => setMenuOpen(false)}
          >
            Discordログイン
          </a>
        )}
      </div>
    </header>
  );
}
