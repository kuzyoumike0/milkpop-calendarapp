import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header
      style={{
        background: "black",
        color: "#FDB9C8",
        padding: "15px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#FDB9C8" }}>
        MilkPOP Calendar
      </h1>
      <nav>
        <Link
          to="/"
          style={{
            marginRight: "20px",
            textDecoration: "none",
            color: "#FDB9C8",
            fontWeight: "bold",
          }}
        >
          トップ
        </Link>
        <Link
          to="/link"
          style={{
            marginRight: "20px",
            textDecoration: "none",
            color: "#FDB9C8",
            fontWeight: "bold",
          }}
        >
          日程登録
        </Link>
        <Link
          to="/personal"
          style={{
            textDecoration: "none",
            color: "#FDB9C8",
            fontWeight: "bold",
          }}
        >
          個人スケジュール
        </Link>
      </nav>
    </header>
  );
}
