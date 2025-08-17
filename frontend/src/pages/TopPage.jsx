import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-6 text-primary">ようこそ MilkpopCalendar へ</h1>
      <div className="space-x-4">
        <Link to="/personal" className="px-4 py-2 bg-primary text-dark rounded-lg hover:bg-secondary hover:text-white">個人スケジュール</Link>
        <Link to="/shared" className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary hover:text-dark">共有スケジュール</Link>
      </div>
    </div>
  );
}
