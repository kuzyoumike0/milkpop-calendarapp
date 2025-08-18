import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h1>トップページ</h1>
      <button onClick={() => navigate("/share")}>共有カレンダーへ</button>
      <button onClick={() => navigate("/personal")}>個人スケジュールへ</button>
    </div>
  );
}
