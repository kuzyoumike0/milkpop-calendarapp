import React from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#000", minHeight: "100vh", color: "#fff" }}>
      <header style={{ background: "#111", color: "#FDB9C8", padding: "1rem 2rem", fontSize: "1.5rem", fontWeight: "bold", borderBottom: "2px solid #004CA0", display:"flex", alignItems:"center" }}>
        <span style={{ flex:1, textAlign:"left" }}>MilkpopCalendar</span>
        <nav style={{ display:"flex", gap:"1rem" }}>
          <Link to="/" style={{ color:"#FDB9C8", textDecoration:"none" }}>トップ</Link>
          <Link to="/personal" style={{ color:"#FDB9C8", textDecoration:"none" }}>個人</Link>
        </nav>
      </header>
      <main style={{ maxWidth: 960, margin: "2rem auto", padding: "1rem", background: "#111", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
        {children}
      </main>
    </div>
  );
}
