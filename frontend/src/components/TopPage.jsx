import React from "react";
import "../common.css";   // ✅ 修正

function TopPage() {
  return (
    <div className="top-container">
      <img src="/logo.png" alt="MilkPOP Calendar" className="top-logo" />
      <div className="top-description card">
        <h2>ようこそ MilkPOP Calendar へ！</h2>
        <p>ポップで可愛いデザインのカレンダーで、あなたのスケジュールを管理しましょう。</p>
        <p>個人用スケジュール登録や共有リンク発行も簡単！</p>
      </div>
    </div>
  );
}

export default TopPage;
