import React from "react";
import { Link } from "react-router-dom";

export default function App({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start text-white">
      {/* バナー */}
      <header className="w-full bg-black/30 backdrop-blur-md shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-pink-300">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:text-pink-400">トップ</Link>
          <Link to="/link" className="hover:text-pink-400">共有スケジュール</Link>
          <Link to="/personal" className="hover:text-pink-400">個人スケジュール</Link>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-4xl p-6">{children}</main>
    </div>
  );
}
