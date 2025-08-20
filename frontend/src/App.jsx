import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import TopPage from "./components/TopPage";
import LinkPage from "./components/LinkPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import ShareLinkPage from "./components/ShareLinkPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* トップページ */}
          <Route path="/" element={<TopPage />} />

          {/* 日程登録ページ */}
          <Route path="/link" element={<LinkPage />} />

          {/* 個人日程登録ページ */}
          <Route path="/personal" element={<PersonalPage />} />

          {/* 共有ページ（登録したスケジュールの回答用） */}
          <Route path="/share/:linkid" element={<SharePage />} />

          {/* 共有リンクページ（発行されたリンクを表示） */}
          <Route path="/sharelink/:linkid" element={<ShareLinkPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
