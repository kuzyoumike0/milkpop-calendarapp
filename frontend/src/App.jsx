// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import ShareLinkPage from "./components/ShareLinkPage"; // ✅ 変更：SharePage → ShareLinkPage
import UsagePage from "./components/UsagePage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthSuccess from "./components/AuthSuccess"; // ✅ 追加

// ====== CSS 全部読み込み ======
import "./common.css";
import "./header_footer.css";
import "./personal.css";
import "./register.css";
import "./share.css";
import "./top.css";
import "./usage.css";

// 旧 /me リダイレクト（不要なら削除してOK）
function MeRedirect() {
  useEffect(() => {
    window.location.replace("/personal");
  }, []);
  return <div style={{ textAlign: "center", padding: "50px" }}>ログイン完了...</div>;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ localStorage の JWT を使って /api/me に問い合わせる
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetch("/api/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // 👈 JWT を渡す
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("not logged in");
        const data = await res.json();
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>読込中...</div>;
  }

  return (
    <Router>
      <Header user={user} />

      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/personal" element={<PersonalPage />} />
        <Route path="/share/:token" element={<ShareLinkPage />} /> {/* ✅ 変更 */}
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/auth/success" element={<AuthSuccess />} /> {/* ✅ 追加 */}
        <Route path="/me" element={<MeRedirect />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
