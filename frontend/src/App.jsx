import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import Header from "./components/Header";
import Footer from "./components/Footer";

/* 共通スタイルを全体に読み込む */
import "./styles/common.css";
import "./styles/header_footer.css";

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
