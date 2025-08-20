import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import ShareLinkPage from "./components/ShareLinkPage";
import SharePage from "./components/SharePage";

export default function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen text-white">
        {/* バナー */}
        <header className="bg-[#FDB9C8] text-black p-4 shadow-md flex justify-between items-center">
          <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:text-[#004CA0]">トップ</Link>
            <Link to="/link" className="hover:text-[#004CA0]">日程登録</Link>
            <Link to="/personal" className="hover:text-[#004CA0]">個人スケジュール</Link>
          </nav>
        </header>

        {/* ページ遷移 */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/link" element={<LinkPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/share/:linkid" element={<SharePage />} />
            <Route path="/sharelink" element={<ShareLinkPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
