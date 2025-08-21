// frontend/src/components/TopPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./TopPage.css"; // 独自スタイルを読み込み

const TopPage = () => {
  return (
    <div className="top-page">
      {/* バナー */}
      <header className="banner">
        <span className="logo">🌸 MilkPOP Calendar</span>
        <nav className="nav">
          <Link to="/register" className="nav-link">日程登録</Link>
          <Link to="/personal" className="nav-link">個人スケジュール</Link>
        </nav>
      </header>

      {/* メイン */}
      <main className="main">
        <h1 className="title">ようこそ MilkPOP Calendar へ</h1>
        <p className="description">
          スケジュールを簡単に登録して、みんなと共有できる便利なカレンダーアプリです。
        </p>

        <div className="button-group">
          <Link to="/register" className="btn btn-pink">日程登録へ</Link>
          <Link to="/personal" className="btn btn-blue">個人スケジュールへ</Link>
        </div>
      </main>
    </div>
  );
};

export default TopPage;
