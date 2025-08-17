import React from "react";

export default function PersonalPage() {
  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>個人スケジュール</h2>
      <input type="text" placeholder="タイトルを入力" style={{ padding: "8px", width: "100%", margin: "10px 0" }} />
      <div style={{ border: "1px solid #FDB9C8", padding: "20px", borderRadius: "8px" }}>
        <p>🗓 自作カレンダー（実装例）</p>
      </div>
    </div>
  );
}
