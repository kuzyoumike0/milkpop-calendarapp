// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

const TopPage = () => {
  return (
    <main className="flex-grow container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-6 text-[#004CA0]">
        MilkPOP Calendar
      </h1>
      <p className="text-lg mb-8 text-gray-700">
        あなたの予定を簡単に登録・共有できるカレンダーサービスです。
      </p>


    </main>
  );
};

export default TopPage;
