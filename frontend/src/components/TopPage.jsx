import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import "../index.css";

const TopPage = () => {
  return (
    <div className="app-container top-page">
      <Header />

      <main className="flex flex-col items-center justify-center text-center">
        {/* 📌 中央メッセージ */}
        <h1 className="top-message">
          ようこそ <span style={{ color: "#FDB9C8" }}>MilkPOP Calendar</span> へ！
        </h1>

        {/* 📌 ロゴ画像 */}
        <img
          src="/logo.png"
          alt="MilkPOP Calendar"
          className="top-logo"
        />

      </main>

      <Footer />
    </div>
  );
};

export default TopPage;
