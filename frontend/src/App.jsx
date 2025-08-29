// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopPage from "./components/TopPage";
import RegisterPage from "./components/RegisterPage";
import PersonalPage from "./components/PersonalPage";
import SharePage from "./components/SharePage";
import UsagePage from "./components/UsagePage";
import Header from "./components/Header";
import Footer from "./components/Footer";

// ====== CSS 全部読み込み ======
import "./common.css";
import "./header_footer.css";
import "./personal.css";
import "./register.css";
import "./share.css";
import "./top.css";
import "./usage.css";

// リダイレクト
function MeRedirect() {
  useEffect(() => {
    window.location.replace("/personal");
  }, []);
  return <div style={{ textAlign: "center", padding: "50px" }}>ログイン完了...</div>;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Cookieベースのログイン状態確認
  useEffect(() => {
    console.log("🔍 /api/me 呼び出し開始");

    fetch("/api/me", {
      method: "GET",
      credentials: "include", // ✅ Cookieを送信
    })
      .then(async (res) => {
        console.log("📡 /api/me response status:", res.status);
        if (!res.ok) throw new Error("not logged in");
        const data = await res.json();
        console.log("✅ /api/me response data:", data);
        setUser(data.user);
      })
      .catch((err) => {
        console.warn("❌ /api/me error:", err);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        読み込み中...
      </div>
    );
  }

  return (
    <Router>
      {/* 共通ヘッダー */}
      <Header user={user} />

      {/* ページごとのルーティング */}
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/personal"
          element={
            user ? (
              <PersonalPage user={user} />
            ) : (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <h2>🔒 個人スケジュールページ</h2>
                <p>このページを利用するには Discord ログインが必要です。</p>
                <a
                  href="/auth/discord"
                  style={{
                    display: "inline-block",
                    marginTop: "20px",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    background: "#004CA0",
                    color: "#fff",
                    fontWeight: "bold",
                    textDecoration: "none",
                  }}
                >
                  Discordでログイン
                </a>
              </div>
            )
          }
        />
        <Route path="/share/:token" element={<SharePage />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/me" element={<MeRedirect />} />
      </Routes>

      {/* 共通フッター */}
      <Footer />
    </Router>
  );
}

export default App;
