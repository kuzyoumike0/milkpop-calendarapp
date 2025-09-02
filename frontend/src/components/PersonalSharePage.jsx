// frontend/src/components/PersonalSharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../personal.css";
import "../common.css";

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${day}`;
  } catch {
    return iso;
  }
};

const fmtTimeRange = (ev) => {
  if (ev.allDay) return "終日";
  if (ev.slot === "night") return "夜";
  if (ev.slot === "day") return "昼";
  if (ev.startTime && ev.endTime) return `${ev.startTime} - ${ev.endTime}`;
  return "時間未設定";
};

export default function PersonalSharePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(null);
  const [events, setEvents] = useState([]);
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/personal/view/${token}`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!alive) return;
        setOwner(data.owner || null);
        setTitle(data.title || "個人スケジュール");
        setEvents(Array.isArray(data.events) ? data.events : []);
        setLinks(Array.isArray(data.links) ? data.links : []);
      } catch (e) {
        setOwner(null);
        setTitle("個人スケジュール（共有）");
        setEvents([]);
        setLinks([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  return (
    <div className="personal-page view-only">
      <div className="page-header">
        <h1 className="brand">MilkPOP Calendar</h1>
        <div className="breadcrumbs">
          <Link to="/" className="nav-pill">トップ</Link>
          <Link to="/register" className="nav-pill">日程登録</Link>
          <Link to="/personal" className="nav-pill">個人スケジュール</Link>
        </div>
      </div>

      <div className="card glass">
        <div className="card-header">
          <h2 className="card-title">
            {title} <span className="badge">閲覧専用</span>
          </h2>
          {owner?.displayName && (
            <p className="muted">作成者: {owner.displayName}</p>
          )}
        </div>

        {loading ? (
          <div className="skeleton-list">
            <div className="skeleton-item" />
            <div className="skeleton-item" />
            <div className="skeleton-item" />
          </div>
        ) : (
          <>
            <section className="section">
              <h3 className="section-title">登録済みの予定</h3>
              {events.length === 0 ? (
                <p className="muted">まだ予定がありません。</p>
              ) : (
                <ul className="event-list">
                  {events
                    .slice()
                    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
                    .map((ev, idx) => (
                      <li key={idx} className="event-item">
                        <div className="event-date">{fmtDate(ev.date)}</div>
                        <div className="event-main">
                          <div className="event-title">{ev.title || "（無題）"}</div>
                          <div className="event-meta">
                            <span className="chip">{fmtTimeRange(ev)}</span>
                            {Array.isArray(ev.tags) && ev.tags.length > 0 && (
                              <span className="chip outline">
                                {ev.tags.join(" / ")}
                              </span>
                            )}
                          </div>
                          {ev.memo && <p className="event-memo">{ev.memo}</p>}
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </section>

            <section className="section">
              <h3 className="section-title">共有リンク（作成者のメモ）</h3>
              {links.length === 0 ? (
                <p className="muted">共有リンクはありません。</p>
              ) : (
                <ul className="link-list">
                  {links.map((lk, i) => (
                    <li key={i} className="link-item">
                      <a href={lk.url} target="_blank" rel="noreferrer" className="cool-link">
                        {lk.title || lk.url}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
