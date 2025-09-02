import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function PersonalSharePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/personal-events/share/${token}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSchedule(data);
      } catch (e) {
        console.error("共有個人日程取得エラー:", e);
        setError("この共有リンクは無効です。");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const timeLabel = (t, s, e) =>
    t === "allday"
      ? "終日"
      : t === "morning"
      ? "午前"
      : t === "afternoon"
      ? "午後"
      : `${s ?? "—"}〜${e ?? "—"}`;

  return (
    <div className="share-page">
      <header className="banner">
        <div className="brand">MilkPOP Calendar</div>
        <nav className="nav">
          <Link to="/">トップ</Link>
          <Link to="/register">日程登録</Link>
          <Link to="/personal">個人スケジュール</Link>
        </nav>
      </header>

      <h1 className="page-title">共有された個人日程</h1>

      {loading ? (
        <div className="schedule-card">読み込み中...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : !schedule ? (
        <div className="schedule-card">データが見つかりません</div>
      ) : (
        <section className="registered-list">
          <h2 className="schedule-header">{schedule.title}</h2>
          {schedule.memo && <p>{schedule.memo}</p>}
          {schedule.dates.map((d, idx) => (
            <div className="schedule-card" key={idx}>
              {d.date} / {timeLabel(d.timeType, d.startTime, d.endTime)}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
