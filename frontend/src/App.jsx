import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

export default function App() {
  return (
    <Router>
      <div className="bg-black text-white min-h-screen flex flex-col">
        {/* バナー */}
        <header className="bg-[#111] shadow-md">
          <div className="max-w-5xl mx-auto flex justify-between items-center p-4">
            <h1 className="text-2xl font-extrabold text-[#FDB9C8] tracking-wide">
              MilkPOP Calendar
            </h1>
            <nav className="space-x-6">
              <Link
                to="/"
                className="hover:text-[#FDB9C8] transition font-medium"
              >
                トップ
              </Link>
              <Link
                to="/link"
                className="hover:text-[#FDB9C8] transition font-medium"
              >
                日程登録
              </Link>
              <Link
                to="/personal"
                className="hover:text-[#FDB9C8] transition font-medium"
              >
                個人スケジュール
              </Link>
              <Link
                to="/sharelink"
                className="hover:text-[#FDB9C8] transition font-medium"
              >
                共有リンク一覧
              </Link>
            </nav>
          </div>
        </header>

        {/* コンテンツ */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/link" element={<LinkPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/share/:linkid" element={<SharePage />} />
            <Route path="/sharelink" element={<ShareLinkPage />} />
          </Routes>
        </main>

        {/* フッター */}
        <footer className="bg-[#111] text-gray-400 text-center py-4 text-sm">
          © 2025 MilkPOP Calendar
        </footer>
      </div>
    </Router>
  );
}
