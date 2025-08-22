import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import LinkPage from "./components/LinkPage";
import Footer from "./components/Footer";
import Header from "./components/Header";
import "./index.css";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* 👇 共通ヘッダー */}
        <Header />

        {/* メインコンテンツ */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/share" element={<SharePage />} />
            <Route path="/sharelink" element={<ShareLinkPage />} />
            <Route path="/link" element={<LinkPage />} />
          </Routes>
        </main>

        {/* 👇 共通フッター */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
