import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="page-container">
      <div className="card">
        <h1 className="page-title">ようこそ！MilkPOP Calendar</h1>
        <p className="page-text">
          予定を登録して友達や仲間と簡単に共有できるカレンダーです。<br />
          上のメニューから「日程登録」や「個人スケジュール」を使ってください。
        </p>
      </div>
    </div>
  );
};

export default TopPage;
