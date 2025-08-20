import React from "react";
import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>MilkPOP Calendar</header>
      <div style={styles.menu}>
        <Link to="/link" style={styles.link}>📅 日程登録ページ</Link>
        <Link to="/personal" style={styles.link}>📝 個人スケジュール</Link>
      </div>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", padding: "50px", background: "#000", minHeight: "100vh", color: "#FDB9C8" },
  header: { fontSize: "32px", fontWeight: "bold", color: "#004CA0", marginBottom: "40px" },
  menu: { display: "flex", justifyContent: "center", gap: "20px" },
  link: { padding: "12px 20px", borderRadius: "8px", background: "#FDB9C8", color: "#000", textDecoration: "none", fontWeight: "bold" }
};
