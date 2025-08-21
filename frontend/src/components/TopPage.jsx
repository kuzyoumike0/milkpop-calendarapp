import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      <h2>ようこそ MilkPOP Calendar へ</h2>
      <img src="/sample.jpg" alt="トップ画像" className="top-image" />
      <p>ここから日程を登録したり、個人スケジュールを追加できます。</p>
    </div>
  );
};

export default TopPage;
