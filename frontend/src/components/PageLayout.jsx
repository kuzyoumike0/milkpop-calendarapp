import React from "react";
import { Link } from "react-router-dom";

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-black text-white py-4 px-6 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:text-[#FDB9C8]">トップ</Link>
          <Link to="/link" className="hover:text-[#FDB9C8]">日程登録</Link>
          <Link to="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</Link>
        </nav>
      </header>

      {/* コンテンツ */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
