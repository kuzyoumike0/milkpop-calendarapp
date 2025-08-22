import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import LinkPage from "./components/LinkPage";
import Footer from "./components/Footer";
import "./index.css";

const App = () => {
  return (
    <Router>
      {/* 縦方向レイアウト */}
      <div className="flex flex-col min-h-screen">
        {/* コンテンツ部分 */}
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
        {/* フッター（ページ下部） */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
