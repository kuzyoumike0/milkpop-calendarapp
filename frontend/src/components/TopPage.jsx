import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const TopPage = () => {
  return (
    <>
      <Header />


              <div className="card nav-card">
          <h2 className="title">はじめよう！</h2>
          <p className="subtitle">
            予定を登録して、みんなと共有しましょう。
          </p>
        </div>
      <main className="top-page">
        <img
          src="/logo.png"
          alt="MilkPOP Calendar"
          className="top-logo"
        />


      </main>

      <Footer />
    </>
  );
};

export default TopPage;
