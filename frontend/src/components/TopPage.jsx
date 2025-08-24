import React from "react";
import "../index.css";

const TopPage = () => {
  return (
    <div className="top-container">
      {/* ロゴ画像 */}
      <img src="/logo.png" alt="MilkPOP Calendar Logo" className="top-logo" />

      {/* 説明文 */}
      <p className="top-description">
        MilkPOP Calendar は、仲間と予定を共有できる便利なスケジュールアプリです。<br />
        日程登録や個人スケジュール管理を簡単に行い、共有リンクですぐに友達と予定を合わせられます。
      </p>
    </div>
  );
};

export default TopPage;
