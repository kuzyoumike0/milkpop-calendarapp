// frontend/src/components/PersonalSharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

/**
 * 個人日程 共有ページ（/share/:token）
 * App.jsx 側で Header/Footer を共通表示するため、
 * このコンポーネントでは独自のヘッダー/フッターは持たない。
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
        // バックエンド：GET /api/personal/schedules/:token を想定
        // （まだ未実装でもビルドが通るようにフォールバックあり）
        const res = await fetch(`/api/personal/schedules/${token}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!aborted) {
          setSchedule(data);
          setLoading(false);
        }
      } catch (e) {
        if (!aborted) {
          // フォールバック（デモ表示）
          setSchedule({
            title: "（デモ）個人スケジュール",
            share_token: token,
            events: [
              { date: "2025-09-05", range: "複数選択", slots: ["昼", "夜"] },
              { date: "2025-09-06", range: "範囲選択", slots: ["終日"] },
            ],
            my_links: [
              { url: "https://example.com/my-portfolio", title: "自分の共有リンク例" },
            ],
            created_at: "2025-09-01T00:00:00Z",
          });
          setError(String(e));
          setLoading(false);
        }
      }
    }

    fetchSchedule();
    return () => {
      aborted = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>読み込み中…</h2>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>共有データが見つかりません</h2>
          <p style={styles.muted}>トークン: {token}</p>
          <Link to="/" style={styles.primaryBtn}>トップへ戻る</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{schedule.title}</h2>
        <p style={styles.muted}>共有トークン: <code>{schedule.share_token}</code></p>
        {error && <p style={styles.warn}>⚠ {error}</p>}

        {/* 日程一覧 */}
        <section style={styles.section}>
          <h3 style={styles.h3}>日程</h3>
          <ul style={styles.list}>
            {(schedule.events || []).map((ev, idx) => (
              <li key={idx} style={styles.listItem}>
                <div style={styles.itemRow}>
                  <span style={styles.dateText}>{ev.date}</span>
                  <span style={styles.badge}>{ev.range}</span>
                </div>
                <div style={styles.slotRow}>
                  {(ev.slots || []).map((s, i) => (
                    <span key={i} style={styles.slotChip}>{s}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 自分が入力した共有リンクURLとタイトル一覧 */}
        <section style={styles.section}>
          <h3 style={styles.h3}>自分の共有リンク</h3>
          {(!schedule.my_links || schedule.my_links.length === 0) ? (
            <p style={styles.muted}>（リンクはまだありません）</p>
          ) : (
            <ul style={styles.list}>
              {schedule.my_links.map((l, i) => (
                <li key={i} style={styles.listItem}>
                  <a href={l.url} target="_blank" rel="noreferrer" style={styles.anchor}>
                    {l.title || l.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div style={styles.actions}>
          <Link to="/personal" style={styles.secondaryBtn}>個人スケジュールへ</Link>
          <Link to="/" style={styles.primaryBtn}>トップへ</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 160px)", // ヘッダー/フッター分の余白を考慮
    background: "linear-gradient(135deg, #FDB9C8 0%, #004CA0 100%)",
    padding: "24px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: "960px",
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  title: { margin: "0 0 6px", fontWeight: 800 },
  muted: { opacity: 0.9 },
  warn: { color: "#FFD966", marginTop: 6 },
  section: { marginTop: 20 },
  h3: { margin: "0 0 10px", fontSize: "1.1rem" },
  list: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 },
  listItem: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "12px 14px",
  },
  itemRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  dateText: { fontWeight: 700 },
  badge: {
    background: "#FDB9C8",
    color: "#000",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: 12,
    fontWeight: 700,
  },
  slotRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  slotChip: {
    background: "rgba(255,255,255,0.15)",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: 12,
  },
  actions: { display: "flex", gap: 10, marginTop: 16 },
  primaryBtn: {
    background: "#FDB9C8",
    color: "#000",
    padding: "8px 14px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryBtn: {
    background: "#004CA0",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.25)",
  },
  anchor: { color: "#fff", textDecoration: "underline" },
};
