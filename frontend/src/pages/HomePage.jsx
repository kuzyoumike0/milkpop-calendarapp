import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #d9a7c7 0%, #fffcdc 100%)",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "1.5rem", color: "#ff6f61" }}>カレンダーアプリ</h1>
        <p>使いたい機能を選んでください</p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link
            to="/shared/demo"
            style={{
              display: "inline-block",
              margin: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: "#ff6f61",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            共有スケジュール
          </Link>
          <Link
            to="/calendar"
            style={{
              display: "inline-block",
              margin: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: "#4caf50",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            自作カレンダー
          </Link>
        </div>
      </div>
    </div>
  );
}
