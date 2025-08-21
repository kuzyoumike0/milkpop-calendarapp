// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="page-container">
        {/* 全ページ共通ヘッダー */}
        <Header />

        {/* ページごとに切り替え */}
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/share" element={<RegisterPage />} />
          <Route path="/personal" element={<PersonalPage />} />
        </Routes>

        {/* 全ページ共通フッター */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
