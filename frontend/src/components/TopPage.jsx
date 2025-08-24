// frontend/src/components/TopPage.jsx
import React from "react";
import "../index.css";

function TopPage() {
  return (
    <div className="top-container">
      {/* トップ画像 */}
      <img
        src="/assets/logo.png" // 📌 public/assets/logo.png に置いてください
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
        <p>
          個人用スケジュール登録や共有リンク発行も簡単！
        </p>
      </div>
    </div>
  );
}

export default TopPage;
