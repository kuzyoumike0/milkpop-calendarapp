import React from "react";
import { Link } from "react-router-dom";

const TopPage = () => {
  return (
    <div>
      {/* バナー */}
      <header className="banner">
        <span>MilkPOP Calendar</span>
        <nav>
          <Link to="/" className="nav-link">トップ</Link>
          <Link to="/share" className="nav-link">日程登録</Link>
          <Link to="/personal" className="nav-link">個人スケジュール</Link>
        </nav>
      </header>

      {/* メイン */}
      <main style={{ textAlign: "center", padding: "40px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
          ようこそ MilkPOP Calendar へ
        </h1>
        <p style={{ fontSize: "18px", marginBottom: "40px" }}>
          日程を登録して共有リンクを発行したり、個人スケジュールを管理できます。
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <Link to="/share">
            <button className="btn btn-pink">日程登録ページへ</button>
          </Link>
          <Link to="/personal">
            <button className="btn btn-pink">個人スケジュールへ</button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default TopPage;
