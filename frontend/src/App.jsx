// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="app-container">
      {/* ✅ 共通ヘッダー */}
      <Header />

      {/* ページごとのルーティング */}
      <main>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/share/:id" element={<SharePage />} />
          <Route path="/sharelink" element={<ShareLinkPage />} />
        </Routes>
      </main>

      {/* ✅ 共通フッター */}
      <Footer />
    </div>
  );
};

export default App;
