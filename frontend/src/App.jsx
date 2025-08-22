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
        <Header />

        <main className="main-content">
          <Routes>
            {/* ルートにトップページを割り当て */}
            <Route path="/" element={<TopPage />} />

            {/* 日程登録ページ */}
            <Route path="/share" element={<RegisterPage />} />

            {/* 個人スケジュールページ */}
            <Route path="/personal" element={<PersonalPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
