import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const TopPage = () => {
  return (
    <>
      <Header />
      <main className="top-page">
        {/* ロゴ */}
        <img
          src="/logo.png"
          alt="MilkPOP Calendar"
          className="top-logo"
        />

        {/* メインカード */}
        <div className="card nav-card">
          <h2 className="title">はじめよう！</h2>
          <p className="subtitle">
            予定を登録して、みんなと共有しましょう。
          </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TopPage;
