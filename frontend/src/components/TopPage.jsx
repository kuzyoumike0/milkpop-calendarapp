import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div>
      <h2>🏠 トップページ</h2>
      <p>このアプリでは、みんなで日程を共有できます。</p>

      <div style={{ marginTop: "20px" }}>
        <Link to="/register" style={{ marginRight: "15px" }}>
          📌 日程登録ページへ
        </Link>
        <Link to="/personal">
          ✍ 個人日程登録ページへ
        </Link>
      </div>
    </div>
  );
}
