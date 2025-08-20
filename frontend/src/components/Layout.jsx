import React from "react";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      {/* 共通ヘッダー */}
      <Header />

      {/* ページごとの内容 */}
      <div className="pt-20 px-4 relative z-10">
        {children}
      </div>
    </div>
  );
}
