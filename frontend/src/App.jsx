import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import PersonalPage from "./components/PersonalPage";
import LinkPage from "./components/LinkPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";
import Banner from "./components/Banner";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* 共通バナー */}
        <Banner />

        {/* ページコンテンツ */}
        <main className="flex-1 flex justify-center items-center p-6">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/link" element={<LinkPage />} />
            <Route path="/share/:linkid" element={<SharePage />} />
            <Route path="/sharelink" element={<ShareLinkPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
