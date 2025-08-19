import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div>
      <h2>トップページ</h2>
      <p>
        <Link to="/link">日程登録ページへ</Link>
      </p>
      <p>
        <Link to="/personal">個人スケジュールページへ</Link>
      </p>
    </div>
  );
}
