import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🏠 トップページ</h1>
      <p>カレンダーアプリへようこそ！ 以下のリンクから各ページへ移動できます。</p>
      <ul>
        <li><Link to="/shared">📅 共有カレンダー</Link></li>
        <li><Link to="/personal">👤 個人スケジュール</Link></li>
      </ul>
    </div>
  );
}
