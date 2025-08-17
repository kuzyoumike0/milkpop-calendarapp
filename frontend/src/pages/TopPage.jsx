import { Link } from "react-router-dom";

export default function TopPage() {
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#fafafa", minHeight: "100vh" }}>
      <header style={{ background: "#ff6f61", color: "#fff", padding: "1rem", textAlign: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
        MilkpopCalendar
      </header>

      <main style={{ maxWidth: 600, margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: "12px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>トップページ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Link to="/personal" style={{ padding: "1rem", background: "#ff6f61", color: "#fff", borderRadius: "8px", textDecoration: "none" }}>個人スケジュール</Link>
          <Link to="/shared/demo" style={{ padding: "1rem", background: "#4caf50", color: "#fff", borderRadius: "8px", textDecoration: "none" }}>共有スケジュール</Link>
        </div>
      </main>
    </div>
  );
}
