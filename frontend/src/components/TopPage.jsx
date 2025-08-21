// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const TopPage = () => {
  return (
    <div className="page-container">
      <div className="main-content">
        <h2>ようこそ、MilkPOP Calendar へ</h2>
        <img
          src="/logo.png"
          alt="Logo"
          className="logo-image"
        />
        <p>スケジュールを登録して共有しましょう！</p>

        <div className="button-group">
          <Link to="/share" className="btn">
            日程登録ページへ
          </Link>
          <Link to="/personal" className="btn">
            個人スケジュールページへ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopPage;
