// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import sampleImage from "../assets/sample.png"; // 画像ファイルを置くパス

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

        {/* 小さめ画像 */}
        <div>
          <img 
            src={sampleImage} 
            alt="イメージ" 
            style={{ width: "150px", height: "auto", margin: "20px auto", display: "block" }}
          />
        </div>

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
