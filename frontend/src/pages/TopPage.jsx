import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopPage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "20px" }}>
      <h1>トップページ</h1>
      <button onClick={() => navigate("/personal")}>個人スケジュール作成</button>
      <button onClick={() => navigate("/shared")} style={{ marginLeft: "10px" }}>共有スケジュール作成</button>
    </div>
  );
}
