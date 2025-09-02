// frontend/src/components/PersonalSharePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

// ✅ スタイル（ヘッダーは App.jsx で描画するのでここでは描画しない）
import "../common.css";
import "../personal.css";

/* ========================= ユーティリティ ========================= */
const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${y}/${m}/${day}`;
  } catch {
    return iso ?? "";
  }
};

const fmtTimeRange = (ev) => {
  if (!ev) return "";
  if (ev.allDay) return "終日";
  if (ev.slot === "night") return "夜";
  if (ev.slot === "day") return "昼";
  if (ev.startTime && ev.endTime) return `${ev.startTime} - ${ev.endTime}`;
  if (ev.startTime) return `${ev.startTime} -`;
  return "時間未設定";
};

// 先頭の日付（並び替え用）
const getFirstDate = (ev) => {
  if (Array.isArray(ev?.dates) && ev.dates.length > 0) return ev.dates[0];
  if (ev?.date) return ev.date;
  if (ev?.range?.start) return ev.range.start;
  return "9999-12-31";
};

/* ========================= 画面本体 ========================= */
export default function PersonalSharePage() {
  // 共有URLにトークンがある想定（/share/:token など）
  const { token } = useParams();

  const [events, setEvents] = useState([]);
  const [links, setLinks] = useState([]);

  // localStorage のキー（トークン別保管に対応）
  const storageKeys = useMemo(() => {
    const suffix = token ? `:${token}` : "";
    return {
      events: `personalEvents${suffix}`,
      links: `personalShareLinks${suffix}`,
    };
  }, [token]);

  // ✅ 登録データを取得して即時反映
  useEffect(() => {
    try {
      const savedEvents =
        JSON.parse(localStorage.getItem(storageKeys.events)) || [];
      const savedLinks =
        JSON.parse(localStorage.getItem(storageKeys.links)) || [];
      setEvents(Array.isArray(savedEvents) ? savedEvents : []);
      setLinks(Array.isArray(savedLinks) ? savedLinks : []);
    } catch {
      setEvents([]);
      setLinks([]);
    }
  }, [storageKeys]);

  // ソート（古い日付順）
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) =>
      getFirstDate(a).localeCompare(getFirstDate(b))
    );
  }, [events]);

  return (
    <div className="personal-share-page">
      <div className="card glass">
        <div className="card-header">
          <h2 className="section-title">
            個人スケジュール（共有）
            <span className="badge-readonly">閲覧専用</span>
          </h2>
          {/* ヘッダーの重複を避けるため、ここではグローバルの Header は描画しない */}
        </div>

        {/* ===== 登録済みの予定 ===== */}
        <section className="section-block">
          <h3 className="block-title">📅 登録済みの予定</h3>

          {sortedEvents.length === 0 ? (
            <p className="muted">まだ予定がありません。</p>
          ) : (
            <ul className="event-list">
              {sortedEvents.map((ev, i) => {
                const dateLabel = Array.isArray(ev.dates)
                  ? ev.dates.map(fmtDate).join("、")
                  : ev.range && ev.range.start && ev.range.end
                  ? `${fmtDate(ev.range.start)} 〜 ${fmtDate(ev.range.end)}`
                  : ev.date
                  ? fmtDate(ev.date)
                  : "日付未設定";

                return (
                  <li className="event-item" key={`${getFirstDate(ev)}_${i}`}>
                    <div className="event-date">{dateLabel}</div>
                    <div className="event-main">
                      <div className="event-title">
                        {ev.title || "（無題）"}
                      </div>
                      <div className="event-time">{fmtTimeRange(ev)}</div>
                    </div>
                    {ev.memo ? (
                      <div className="event-memo">📝 {ev.memo}</div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ===== 共有リンク（URLとタイトルの一覧） ===== */}
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
