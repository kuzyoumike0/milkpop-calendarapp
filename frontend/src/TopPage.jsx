import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopPage() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <h1>トップページ</h1>
      <button onClick={() => navigate("/personal")}>📝 個人スケジュール</button>
      <button onClick={() => navigate("/share/preview")}>🔗 共有スケジュール</button>
    </div>
  );
}
