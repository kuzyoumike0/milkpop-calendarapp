// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";
import logo from "../public/logo.png"; // public に置いた logo.png を読み込み

const TopPage = () => {
  return (
    
      <p className="text-lg mb-8 text-gray-700">
        あなたの予定を簡単に登録・共有できるカレンダーサービスです。
      </p>
    <main className="flex-grow container mx-auto px-4 py-12 text-center">
      {/* ロゴ */}
      <div className="flex justify-center mb-10">
        <img
          src={logo}
          alt="MilkPOP Calendar Logo"
          className="max-w-full"
          style={{ width: "1040px" }}
        />
      </div>


    </main>
  );
};

export default TopPage;
