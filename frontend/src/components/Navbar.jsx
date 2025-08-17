import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="backdrop-blur-lg bg-white/40 shadow-md rounded-xl m-4 p-4 flex gap-4">
      <Link to="/" className="font-bold text-lg">🏠 Home</Link>
      <Link to="/setup">⚙️ 共有設定</Link>
      <Link to="/personal">👤 個人スケジュール</Link>
    </nav>
  );
}
