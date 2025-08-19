import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h1>みんなのカレンダー</h1>
      <p>個人スケジュールの登録や、共有リンクで予定をみんなと共有できます。</p>

      <div style={{ marginTop: "20px" }}>
        <button
          style={{ padding: "10px 20px", marginRight: "10px" }}
          onClick={() => navigate("/personal")}
        >
          個人スケジュール
        </button>

        <button
          style={{ padding: "10px 20px" }}
          onClick={() => navigate("/share")}
        >
          共有リンク発行
        </button>
      </div>
    </div>
  );
}
