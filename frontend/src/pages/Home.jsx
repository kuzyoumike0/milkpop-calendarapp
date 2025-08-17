import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="text-center text-2xl text-primary">
      <p>ようこそ！</p>
      <div className="mt-6 space-x-4">
        <Link to="/personal" className="bg-primary text-elegantBlack px-4 py-2 rounded">個人スケジュール</Link>
        <Link to="/shared" className="bg-secondary text-white px-4 py-2 rounded">共有スケジュール</Link>
      </div>
    </div>
  );
}
