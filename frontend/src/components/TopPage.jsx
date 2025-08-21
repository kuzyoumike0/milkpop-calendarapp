// frontend/src/components/TopPage.jsx
import React from "react";
import logo from "../public/logo.png";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      <div className="logo-wrapper">
        <img src={logo} alt="logo" className="logo-image" />
      </div>
      <h2 className="welcome-text">ようこそ MilkPOP Calendar へ</h2>
    </div>
  );
};

export default TopPage;
