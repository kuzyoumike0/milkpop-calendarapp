// frontend/src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// ✅ CSS をここで一括読み込み（すべて src/ 直下）
import "./common.css";
import "./personal.css";
import "./register.css";
import "./share.css";

// ページコンポーネント
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import SharePage from "./components/SharePage";
import PersonalPage from "./components/PersonalPage";
import ShareLinkPage from "./components/ShareLinkPage"; // 共有リンク直閲覧

// 共通ヘッダー（CSSの .header / .logo-link / .nav-links に合わせる）
const Header = () => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  return (
    <header className="header">
      <Link to="/" className="logo-link" onClick={close}>
        MilkPOP Calendar
      </Link>

      {/* PCナビ */}
      <nav className="nav-links">
        <Link className="nav-link" to="/" onClick={close}>
          トップ
        </Link>
        <Link className="nav-link" to="/register" onClick={close}>
          日程登録
        </Link>
        <Link className="nav-link" to="/personal" onClick={close}>
          個人スケジュール
        </Link>
      </nav>

      {/* ハンバーガー */}
      <button
        className={`hamburger ${open ? "open" : ""}`}
        onClick={toggle}
        aria-label="open navigation"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* モバイルメニュー */}
      <nav
        id="mobile-menu"
        className={`nav-links-mobile ${open ? "open" : ""}`}
        onClick={close}
      >
        <Link className="nav-link-mobile" to="/">
          トップ
        </Link>
        <Link className="nav-link-mobile" to="/register">
          日程登録
        </Link>
        <Link className="nav-link-mobile" to="/personal">
          個人スケジュール
        </Link>
      </nav>
    </header>
  );
};

// 共通フッター（CSSの footer, .footer に合わせる）
const Footer = () => (
  <footer className="footer">
    <div>© {new Date().getFullYear()} MilkPOP</div>
  </footer>
);

export default function App() {
  return (
    <Router>
      <div className="app-root">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/share/:token?" element={<SharePage />} />
            <Route path="/personal" element={<PersonalPage />} />
            {/* 共有リンク閲覧用（例: /sharelink/abcd1234） */}
            <Route path="/sharelink/:token" element={<ShareLinkPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
