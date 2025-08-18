import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ShareButton from "./components/ShareButton";
import PersonalPage from "./PersonalPage";
import SharedPage from "./SharedPage";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <h1>📅 カレンダーアプリ</h1>

        {/* ナビゲーション */}
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "15px" }}>トップページ</Link>
          <Link to="/personal" style={{ marginRight: "15px" }}>個人スケジュール</Link>
          <Link to="/shared">共有カレンダー</Link>
        </nav>

        <Routes>
          {/* トップページ */}
          <Route
            path="/"
            element={
              <div>
                <h2>トップページ</h2>
                <p>ここから各ページに移動できます。</p>
                <ShareButton />
              </div>
            }
          />

          {/* 個人スケジュール */}
          <Route path="/personal" element={<PersonalPage />} />

          {/* 共有カレンダー */}
          <Route path="/shared" element={<SharedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
