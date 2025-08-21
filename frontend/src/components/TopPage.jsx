// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";

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

        {/* public/logo.png を表示 */}
        <div>
          <img
            src="/logo.png"
            alt="ロゴ"
            style={{
              maxWidth: "840px",  // 最大280px
              width: "80%",       // 画面幅の8割まで広がる
              height: "auto",
              margin: "30px auto",
              display: "block",
              borderRadius: "16px",
              boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
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
