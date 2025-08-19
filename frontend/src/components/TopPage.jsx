import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div>
      <h1>トップページ</h1>
      <Link to="/link">日程登録ページへ</Link><br/>
      <Link to="/personal">個人日程登録ページへ</Link>
    </div>
  );
}
