import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>
      <header style={{ background: "#004CA0", padding: "15px", color: "white", fontSize: "24px", fontWeight: "bold" }}>
        MilkPOP Calendar
      </header>
      <h1 style={{ marginTop: "40px", color: "#FDB9C8" }}>ようこそ！</h1>
      <p>スケジュール共有アプリへようこそ</p>
      <div style={{ marginTop: "30px" }}>
        <Link to="/link" style={{ margin: "10px", padding: "15px 25px", background: "#FDB9C8", color: "#000", borderRadius: "8px", textDecoration: "none" }}>
          日程登録ページ
        </Link>
        <Link to="/personal" style={{ margin: "10px", padding: "15px 25px", background: "#004CA0", color: "#fff", borderRadius: "8px", textDecoration: "none" }}>
          個人スケジュール
        </Link>
      </div>
    </div>
  );
}
