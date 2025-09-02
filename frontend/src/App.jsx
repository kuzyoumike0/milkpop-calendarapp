// frontend/src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import "./common.css";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import SharePage from "./components/SharePage";
import PersonalPage from "./components/PersonalPage";
import PersonalSharePage from "./components/PersonalSharePage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthSuccess from "./components/AuthSuccess";
import UsagePage from "./components/UsagePage";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ShareRedirect() {
  const nav = useNavigate();
  const { search } = useLocation();
  useEffect(() => {
    const t = new URLSearchParams(search).get("token");
    nav(t ? `/share/${t}` : "/share", { replace: true });
  }, [search, nav]);
  return null;
}

function ShareEntryPoint() {
  const nav = useNavigate();
  const { search } = useLocation();
  useEffect(() => {
    const t = new URLSearchParams(search).get("token");
    if (t) nav(`/share/${t}`, { replace: true });
  }, [search, nav]);
  // token が無い /share は既存の SharePage をそのまま表示
  return <SharePage />;
}

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/usage" element={<UsagePage />} />
            <Route path="/share" element={<ShareEntryPoint />} />
            <Route path="/share/:token" element={<SharePage />} />
            <Route path="/personal" element={<PersonalPage />} />
            {/* 👇 ログイン成功後のリダイレクト */}
            <Route path="/auth/success" element={<AuthSuccess />} />
            {/* 👇 共有閲覧用（誰でもアクセス可） */}
            <Route path="/personal/share/:token" element={<PersonalSharePage />} />
            {/* 旧ルート救済 */}
            <Route path="/personal/view/:token" element={<Navigate to="/personal/share/:token" replace />} />
            {/* フォールバック */}
            <Route path="*" element={
              <div className="notfound">
                <h2>ページが見つかりません</h2>
                <Link to="/" className="btn primary">トップに戻る</Link>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
