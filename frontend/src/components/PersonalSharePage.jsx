// frontend/src/components/PersonalSharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

/**
 * 個人スケジュール共有ページ
 * - /share/:token でアクセス
 * - 自分の個人スケジュールを共有リンクから閲覧できる
 */
export default function PersonalSharePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let aborted = false;

    async function fetchSchedule() {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!aborted) {
          setSchedule(data);
          setLoading(false);
        }
      } catch (e) {
        if (!aborted) {
          // フォールバック（API未実装でも表示できるようにする）
          setSchedule({
            title: "（デモ）個人スケジュール",
            share_token: token,
            dates: [
              { date: "2025-09-05", slot: "終日" },
              { date: "2025-09-06", slot: "夜" },
            ],
            links: [
              { url: "https://example.com/demo", title: "デモリンク" },
            ],
          });
          setError(String(e));
          setLoading(false);
        }
      }
    }

    fetchSchedule();
    return () => { aborted = true; };
  }, [token]);

  if (loading) {
    return <div style={styles.container}><h2>読み込み中…</h2></div>;
  }

  if (!schedule) {
    return (
      <div style={styles.container}>
        <h2>共有データが見つかりません</h2>
        <p>トークン: {token}</p>
        <Link to="/">トップへ戻る</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.brand}>MilkPOP Calendar</h1>
        <nav style={styles.nav}>
          <Link to="/personal" style={styles.navLink}>個人スケジュール</Link>
          <Link to="/register" style={styles.navLink}>日程登録</Link>
        </nav>
      </header>

      <div style={styles.card}>
        <h2>{schedule.title}</h2>
        {error && <p style={styles.warn}>⚠ {error}</p>}

        <section>
          <h3>日程</h3>
          <ul>
            {(schedule.dates || []).map((d, i) => (
              <li key={i}>
                {d.date} — {d.slot}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3>共有リンク</h3>
          <ul>
            {(schedule.links || []).map((l, i) => (
              <li key={i}>
                <a href={l.url} target="_blank" rel="noreferrer">
                  {l.title || l.url}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div style={{ marginTop: "16px" }}>
          <Link to="/" style={styles.primaryBtn}>トップへ</Link>
          <Link to="/share" style={styles.secondaryBtn}>共有一覧</Link>
        </div>
      </div>

      <footer style={styles.footer}>© 2025 MilkPOP</footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #FDB9C8 0%, #004CA0 100%)",
    color: "#fff",
    padding: "24px",
  },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  brand: { fontSize: "20px", fontWeight: 700 },
  nav: { display: "flex", gap: "12px" },
  navLink: {
    color: "#fff",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.5)",
    padding: "6px 10px",
    borderRadius: "999px",
  },
  card: {
    background: "rgba(0,0,0,0.45)",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  warn: { color: "#FFD966" },
  primaryBtn: {
    background: "#FDB9C8",
    color: "#000",
    padding: "8px 14px",
    borderRadius: "8px",
    textDecoration: "none",
    marginRight: "8px",
  },
  secondaryBtn: {
    background: "#004CA0",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "8px",
    textDecoration: "none",
  },
  footer: { marginTop: "40px", textAlign: "center", opacity: 0.7 },
};
