// frontend/src/components/PersonalSharePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "../common.css";
import "../personal.css";

/* ========== Utils ========== */
const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${y}/${m}/${day}`;
  } catch {
    return iso;
  }
};

const fmtTimeRange = (ev) => {
  if (!ev) return "";
  // 両対応: 保存側が allDay:boolean の場合／日本語スロットの場合
  if (ev.allDay || ev.slot === "終日") return "終日";
  if (ev.slot === "昼") return "昼";
  if (ev.slot === "夜") return "夜";
  if (ev.startTime && ev.endTime) return `${ev.startTime} - ${ev.endTime}`;
  if (typeof ev.startHour === "number" && typeof ev.endHour === "number") {
    return `${pad(ev.startHour)}:00 - ${pad(ev.endHour)}:00`;
  }
  return "時間未設定";
};

// 並び替え用キー
const firstDateKey = (ev) =>
  ev?.date || ev?.dates?.[0] || ev?.range?.start || "9999-12-31";

/* ========== Component ========== */
export default function PersonalSharePage() {
  // /personal/share/:token でアクセスされた場合はそのレコードだけを表示
  const { token } = useParams();

  const [events, setEvents] = useState([]);
  const [links, setLinks] = useState([]);

  // 読み込み（localStorage）
  useEffect(() => {
    try {
      if (token) {
        // 特定レコードのみを再構成して表示（PersonalPage が保存する personalRecords を使用）
        const records = JSON.parse(localStorage.getItem("personalRecords")) || [];
        const rec = records.find((r) => r.id === token);
        if (rec) {
          const evs = (rec.items || []).map((it) => ({
            date: it.date,
            title: rec.title || "（無題）",
            memo: rec.memo || "",
            // 表示用
            allDay: it.slot === "終日",
            slot: it.slot,
            startTime:
              typeof it.startHour === "number" ? `${pad(it.startHour)}:00` : null,
            endTime:
              typeof it.endHour === "number" ? `${pad(it.endHour)}:00` : null,
          }));
          setEvents(evs);
          // 当該レコードの共有リンクのみ
          const allLinks = JSON.parse(localStorage.getItem("personalShareLinks")) || [];
          setLinks(allLinks.filter((l) => l.recordId === token));
          return;
        }
        // 対象が無い場合は空
        setEvents([]);
        setLinks([]);
      } else {
        // 一覧ページ: flatten されたイベントと、全共有リンクを使用
        const evs = JSON.parse(localStorage.getItem("personalEvents")) || [];
        setEvents(Array.isArray(evs) ? evs : []);
        const allLinks = JSON.parse(localStorage.getItem("personalShareLinks")) || [];
        setLinks(Array.isArray(allLinks) ? allLinks : []);
      }
    } catch {
      setEvents([]);
      setLinks([]);
    }
  }, [token]);

  // 古い日付順にソート
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => firstDateKey(a).localeCompare(firstDateKey(b))),
    [events]
  );

  return (
    <div className="personal-share-page">
      <div className="card glass">
        <div className="card-header">
          <h2 className="section-title">
            個人スケジュール（共有） <span className="badge-readonly">閲覧専用</span>
          </h2>
        </div>

        {/* 予定一覧 */}
        <section className="section-block">
          <h3 className="block-title">📅 登録済みの予定</h3>
          {sortedEvents.length === 0 ? (
            <p className="muted">まだ予定がありません。</p>
          ) : (
            <ul className="event-list">
              {sortedEvents.map((ev, i) => (
                <li className="event-item" key={`${firstDateKey(ev)}_${i}`}>
                  <div className="event-date">{fmtDate(ev.date)}</div>
                  <div className="event-main">
                    <div className="event-title">{ev.title || "（無題）"}</div>
                    <div className="event-time">{fmtTimeRange(ev)}</div>
                  </div>
                  {ev.memo ? <div className="event-memo">📝 {ev.memo}</div> : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 共有リンク一覧 */}
        <section className="section-block">
          <h3 className="block-title">🔗 共有リンク（作成者のメモ）</h3>
          {links.length === 0 ? (
            <p className="muted">共有リンクはありません。</p>
          ) : (
            <ul className="link-list">
              {links.map((l, idx) => (
                <li className="link-item" key={`${l.url}_${idx}`}>
                  <a
                    className="pretty-link"
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    title={l.url}
                  >
                    {l.title || l.url}
                  </a>
                  {l.note ? <span className="link-note">（{l.note}）</span> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
