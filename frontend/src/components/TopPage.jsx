import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>📅 カレンダーアプリ</h1>
      <p>以下のページに移動できます</p>
      <nav style={{ marginTop: "20px" }}>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ margin: "10px" }}>
            <Link to="/share">🌐 共有カレンダー</Link>
          </li>
          <li style={{ margin: "10px" }}>
            <Link to="/personal">👤 個人スケジュール</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
