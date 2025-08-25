// frontend/src/components/TopPage.jsx
import React from "react";
import "../styles/top.css"; // ✅ top.css を読み込む

function TopPage() {
  return (
    <div className="top-container">
      {/* トップ画像 */}
      <img
        src="/logo.png" // 📌 public/logo.png に配置してください
        alt="MilkPOP Calendar"
        className="top-logo"
      />

      {/* 中央カード */}
      <div className="top-description card">
        <h2>ようこそ MilkPOP Calendar へ！</h2>
        <p>
          ポップで可愛いデザインのカレンダーで、
          あなたのスケジュールを管理しましょう。
        </p>
        <p>個人用スケジュール登録や共有リンク発行も簡単！</p>
      </div>
    </div>
  );
}

export default TopPage;
