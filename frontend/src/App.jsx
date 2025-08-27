// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import Header from "./components/Header";
import Footer from "./components/Footer";

// ====== CSS 全部読み込み ======
import "./common.css";
import "./header_footer.css";
import "./personal.css";
import "./register.css";
import "./share.css";
import "./top.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ログイン状態を確認
  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>読み込み中...</div>;
  }

  return (
    <Router>
      {/* 共通ヘッダー（ログイン状態を渡す） */}
      <Header user={user} />

      {/* ページごとのルーティング */}
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* 個人ページはログイン必須 */}
        <Route
          path="/personal"
          element={user ? <PersonalPage user={user} /> : <Navigate to="/" />}
        />
        <Route path="/share/:token" element={<SharePage />} />
      </Routes>

      {/* 共通フッター */}
      <Footer />
    </Router>
  );
}

export default App;
