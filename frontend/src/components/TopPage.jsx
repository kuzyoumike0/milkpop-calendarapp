import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6 text-[#FDB9C8]">トップページ</h2>
      <div className="space-x-4">
        <Link to="/link" className="btn-accent">日程登録</Link>
        <Link to="/personal" className="btn-primary">個人日程</Link>
      </div>
    </div>
  );
}
