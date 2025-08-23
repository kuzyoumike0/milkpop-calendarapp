// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-page">
      <div className="card text-center">
        <h1 className="text-2xl font-bold mb-6">ようこそ MilkPOP Calendar へ</h1>
        <img src="/logo192.png" alt="MilkPOP Logo" className="top-logo" />

        <p className="mt-4 mb-6">
          シンプルでかわいい MilkPOP スタイルのカレンダーで、日程登録や共有が簡単にできます。
        </p>

      </div>
    </div>
  );
};

export default TopPage;
