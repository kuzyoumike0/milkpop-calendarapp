// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import SharePage from "./components/SharePage";
import PersonalPage from "./components/PersonalPage";
import PersonalSharePage from "./components/PersonalSharePage";

import "./common.css";

export default function App() {
  return (
    <Router>
      <div className="mp-app">
        {/* 全ページ共通バナー */}
        <Header />

        {/* ページ本体 */}
        <main className="mp-main">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/share" element={<SharePage />} />
            {/* 「個人日程」共有専用ルート */}
            <Route path="/share/:token" element={<PersonalSharePage />} />
          </Routes>
        </main>

        {/* 全ページ共通フッター */}
        <Footer />
      </div>
    </Router>
  );
}
