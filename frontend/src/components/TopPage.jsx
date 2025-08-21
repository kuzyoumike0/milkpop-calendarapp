import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      <h2 className="text-3xl font-bold mb-4">ようこそ MilkPOP Calendar へ</h2>
      <img src="/logo.png" alt="トップ画像" className="top-image" />
      <p className="text-lg mt-4">
        ここから日程を登録したり、個人スケジュールを追加できます。
      </p>
    </div>
  );
};

export default TopPage;
