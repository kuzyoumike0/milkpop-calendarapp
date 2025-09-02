// frontend/src/App.jsx
import React from "react";
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
import ShareLinkPage from "./components/ShareLinkPage"; // ★ 追加

// 共通ヘッダー/フッター
const Header = () => (
  <header className="banner">
    <div className="brand">MilkPOP Calendar</div>
    <nav className="nav">
      <Link to="/">トップ</Link>
      <Link to="/register">日程登録</Link>
      <Link to="/personal">個人スケジュール</Link>
    </nav>
  </header>
);

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
