// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const TopPage = () => {
  return (
    <div className="page-container">
      <h2 className="page-title">ようこそ MilkPOP Calendar へ 🎉</h2>
      <p>
        このアプリは、Discord ログインを利用して
        <br />
        グループの日程調整や個人スケジュール管理ができるツールです。
      </p>
      </div>
    </div>
  );
};

export default TopPage;
