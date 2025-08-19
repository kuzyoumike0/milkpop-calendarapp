import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>ようこそ！</h2>
      <p>このアプリで日程を登録・共有できます。</p>
      <Link to="/register">日程登録ページへ</Link><br />
      <Link to="/personal">個人日程登録ページへ</Link>
    </div>
  );
}
