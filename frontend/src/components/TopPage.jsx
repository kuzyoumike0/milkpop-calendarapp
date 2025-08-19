import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>📅 自作カレンダーアプリ</h1>
      <p>個人スケジュールを登録して共有しましょう。</p>
      <Link to="/share">
        <button>共有リンクを発行する</button>
      </Link>
    </div>
  );
}
