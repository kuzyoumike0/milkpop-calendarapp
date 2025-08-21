import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import SharePage from "./components/SharePage";
import PersonalPage from "./components/PersonalPage";
import ShareLinkPage from "./components/ShareLinkPage";
import LinkPage from "./components/LinkPage";

function App() {
  return (
    <Router>
      {/* 共通バナー */}
      <div className="bg-[#004CA0] text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MilkPOP Calendar</h1>
        <nav className="flex gap-4">
          <Link to="/" className="hover:text-[#FDB9C8]">
            トップ
          </Link>
          <Link to="/share" className="hover:text-[#FDB9C8]">
            日程登録
          </Link>
          <Link to="/personal" className="hover:text-[#FDB9C8]">
            個人スケジュール
          </Link>
        </nav>
      </div>

      {/* ページルーティング */}
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/sharelink" element={<ShareLinkPage />} />
        <Route path="/link" element={<LinkPage />} />
      </Routes>
    </Router>
  );
}

export default App;
