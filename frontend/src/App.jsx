// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import LinkPage from "./components/LinkPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ 全ページ共通のヘッダー */}
      <Header />

      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/share/:id" element={<ShareLinkPage />} />
        <Route path="/links" element={<LinkPage />} />
      </Routes>

      {/* ✅ 全ページ共通のフッター */}
      <Footer />
    </div>
  );
}

export default App;
