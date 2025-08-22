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
      <div className="app-container">
        {/* ヘッダー共通 */}
        <Header />

        {/* ページ切替 */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<TopPage />} />   {/* ← 最初に表示される */}
            <Route path="/share" element={<RegisterPage />} />
            <Route path="/personal" element={<PersonalPage />} />
          </Routes>
        </main>

        {/* フッター共通 */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
