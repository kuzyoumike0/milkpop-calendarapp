import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RegisterPage from "./pages/RegisterPage";
import TopPage from "./pages/TopPage";
import SharePage from "./pages/SharePage";

function App() {
  return (
    <div className="app">
      {/* ✅ 全ページ共通ヘッダー */}
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/share/:id" element={<SharePage />} />
        </Routes>
      </main>

      {/* ✅ 全ページ共通フッター */}
      <Footer />
    </div>
  );
}

export default App;
