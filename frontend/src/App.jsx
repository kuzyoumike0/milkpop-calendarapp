// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import "./common.css";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import SharePage from "./components/SharePage";
import PersonalPage from "./components/PersonalPage";
import PersonalViewPage from "./components/PersonalViewPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/share" element={<SharePage />} />
            <Route path="/personal" element={<PersonalPage />} />
            {/* 👇 共有閲覧用（誰でもアクセス可） */}
            <Route path="/personal/view/:token" element={<PersonalViewPage />} />
            {/* 旧リンク救済 */}
            <Route path="/personal/share/:token" element={<Navigate to="/personal/view/:token" replace />} />
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
