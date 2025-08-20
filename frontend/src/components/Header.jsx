import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-[#004CA0] py-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link
            to="/link"
            className="px-4 py-2 bg-[#FDB9C8] text-black rounded-2xl shadow hover:scale-105 transition"
          >
            日程登録
          </Link>
          <Link
            to="/personal"
            className="px-4 py-2 bg-[#FDB9C8] text-black rounded-2xl shadow hover:scale-105 transition"
          >
            個人スケジュール
          </Link>
        </nav>
      </div>
    </header>
  );
}
