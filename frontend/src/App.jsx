import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";  // 👈 追加
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
            {/* トップページ */}
            <Route path="/" element={<TopPage />} />

            {/* 日程登録ページ */}
            <Route path="/share" element={<RegisterPage />} />

            {/* 共有リンクページ（idごとに表示） */}
            <Route path="/share/:id" element={<SharePage />} />   {/* 👈 新規追加 */}

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
