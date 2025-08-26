// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import Header from "./components/Header";
import Footer from "./components/Footer";

// ====== CSS 一括管理 ======
import "./common.css";          // 共通スタイル
import "./header_footer.css";   // ヘッダー・フッター
import "./register.css";        // RegisterPage専用
import "./share.css";           // SharePage専用
import "./personal.css";        // PersonalPage専用
// TopPage専用があるならここに追加 → import "./top.css";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share/:token" element={<SharePage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
