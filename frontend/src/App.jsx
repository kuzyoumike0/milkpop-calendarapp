import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";

const App = () => {
  return (
    <Router>
      <div className="page-container">
        {/* ===== バナー（共通ヘッダー） ===== */}
        <header className="banner">
          <div className="logo">MilkPOP Calendar</div>
          <nav className="nav">
            <Link to="/">トップ</Link>
            <Link to="/register">日程登録</Link>
            <Link to="/personal">個人スケジュール</Link>
          </nav>
        </header>

        {/* ===== ページ表示部分 ===== */}
        <main>
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/share/:id" element={<SharePage />} />
          </Routes>
        </main>

        {/* ===== フッター ===== */}
        <footer>
          &copy; {new Date().getFullYear()} MilkPOP Calendar
        </footer>
      </div>
    </Router>
  );
};

export default App;
