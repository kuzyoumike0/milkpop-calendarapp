// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import sampleImage from "../public/logo.png"; // 好きな画像を配置してください

const TopPage = () => {
  return (
    <div className="page-container">
      {/* バナー */}
      <header className="banner">
        <h1>MilkPOP Calendar</h1>
        <nav>
          <Link to="/share">日程登録</Link>
          <Link to="/personal">個人スケジュール</Link>
        </nav>
      </header>

      <main className="main-content">
        <h2>ようこそ、MilkPOP Calendar へ</h2>
        <p>スケジュールを登録して共有しましょう！</p>

        {/* ここに画像を追加 */}
        <div>
          <img
            src={sampleImage}
            alt="イメージ"
            style={{
              width: "180px",   // 小さめ
              height: "auto",
              margin: "20px auto",
              display: "block",
              borderRadius: "12px", // おしゃれに角丸
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)" // 影を追加
            }}
          />
        </div>

        {/* ボタン */}
        <div className="button-group">
          <Link to="/share" className="btn">
            日程登録ページへ
          </Link>
          <Link to="/personal" className="btn">
            個人スケジュールページへ
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TopPage;
