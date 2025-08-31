import React, { useMemo, useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";

export default function PersonalPage() {
  /** ===== 共通ユーティリティ ===== */
  const pad2 = (n) => String(n).padStart(2, "0");
  const ymd = (d) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const ymdd = (Y, M, D) => `${Y}-${pad2(M + 1)}-${pad2(D)}`;

  // 日本時間の今日
  const todayJST = (() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const jst = new Date(utc + 9 * 60 * 60000);
    return ymd(jst);
  })();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  /** ===== 状態 ===== */
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  const [mode, setMode] = useState("single"); // single | range | multiple
  const [rangeStart, setRangeStart] = useState(null);

  const [selectedDates, setSelectedDates] = useState(new Set());
  const [dateOptions, setDateOptions] = useState({}); // {dateStr: {timeType, startTime, endTime}}

  const [schedules, setSchedules] = useState([]);

  // Discord共有リンク（自動表示）
  const [shareLinks, setShareLinks] = useState([]);

  // 祝日
  const hd = useMemo(() => new Holidays("JP"), []);

  /** ===== カレンダー情報 ===== */
  const y = current.getFullYear();
  const m = current.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay();
  const weekdayHeaders = ["日", "月", "火", "水", "木", "金", "土"];

  const timeOptions1h = useMemo(() => {
    const arr = [];
    for (let h = 0; h <= 24; h++) arr.push(`${pad2(h)}:00`);
    return arr;
  }, []);

  /** ===== 判定 ===== */
  const holidayName = (Y, M, D) => {
    const info = hd.isHoliday(new Date(Y, M, D));
    return info ? info[0]?.name : null;
  };
  const isToday = (Y, M, D) => ymdd(Y, M, D) === todayJST;
  const isSelected = (Y, M, D) => selectedDates.has(ymdd(Y, M, D));
  const weekdayClass = (w) => (w === 0 ? "sunday" : w === 6 ? "saturday" : "");

  /** ===== 日付選択 ===== */
  const ensureDefaultOption = (dateStr) => {
    setDateOptions((prev) =>
      prev[dateStr]
        ? prev
        : { ...prev, [dateStr]: { timeType: "allday", startTime: null, endTime: null } }
    );
  };

  const addDate = (dateStr) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.add(dateStr);
      return next;
    });
    ensureDefaultOption(dateStr);
  };

  const removeDate = (dateStr) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.delete(dateStr);
      return next;
    });
    setDateOptions((prev) => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
  };

  const handleCellClick = (Y, M, D) => {
    const dateStr = ymdd(Y, M, D);
    if (mode === "single") {
      setSelectedDates(new Set([dateStr]));
      setDateOptions((prev) => ({
        [dateStr]:
          prev[dateStr] || { timeType: "allday", startTime: null, endTime: null },
      }));
      setRangeStart(null);
    } else if (mode === "multiple") {
      selectedDates.has(dateStr) ? removeDate(dateStr) : addDate(dateStr);
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(dateStr);
        setSelectedDates(new Set([dateStr]));
        ensureDefaultOption(dateStr);
        return;
      }
      const a = new Date(rangeStart);
      const b = new Date(dateStr);
      const start = a <= b ? a : b;
      const end = a <= b ? b : a;
      const next = new Set();
      const opts = { ...dateOptions };
      const cur = new Date(start);
      while (cur <= end) {
        const ds = ymd(cur);
        next.add(ds);
        if (!opts[ds])
          opts[ds] = { timeType: "allday", startTime: null, endTime: null };
        cur.setDate(cur.getDate() + 1);
      }
      setSelectedDates(next);
      setDateOptions(opts);
      setRangeStart(null);
    }
  };

  /** ===== カレンダー行列 ===== */
  const matrix = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [firstWeekday, daysInMonth]);

  /** ===== 時間帯設定 ===== */
  const setTimeTypeForDate = (dateStr, t) => {
    setDateOptions((prev) => {
      const old =
        prev[dateStr] || { timeType: "allday", startTime: null, endTime: null };
      let s = old.startTime,
        e = old.endTime;
      if (t !== "custom") {
        s = null;
        e = null;
      } else {
        s = s || "09:00";
        e = e || "18:00";
      }
      return { ...prev, [dateStr]: { timeType: t, startTime: s, endTime: e } };
    });
  };
  const setStartForDate = (dateStr, v) =>
    setDateOptions((p) => ({
      ...p,
      [dateStr]: { ...(p[dateStr] || {}), timeType: "custom", startTime: v },
    }));
  const setEndForDate = (dateStr, v) =>
    setDateOptions((p) => ({
      ...p,
      [dateStr]: { ...(p[dateStr] || {}), timeType: "custom", endTime: v },
    }));

  /** ===== 登録 ===== */
  const handleRegister = () => {
    if (!title.trim() || selectedDates.size === 0) return;
    const newItems = Array.from(selectedDates).sort().map((date) => {
      const opt =
        dateOptions[date] || { timeType: "allday", startTime: null, endTime: null };
      return {
        id: `${date}-${Date.now()}`,
        date,
        title: title.trim(),
        memo: memo.trim(),
        timeType: opt.timeType,
        startTime: opt.timeType === "custom" ? opt.startTime : null,
        endTime: opt.timeType === "custom" ? opt.endTime : null,
      };
    });
    const merged = [...schedules, ...newItems].sort((a, b) =>
      a.date < b.date ? -1 : 1
    );
    setSchedules(merged);
    setSelectedDates(new Set());
    setDateOptions({});
    setRangeStart(null);
  };

  /** ===== Discord共有リンクを自動取得 ===== */
  const loadShareLinks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/personal-shares`);
      if (!res.ok) return;
      const data = await res.json();
      setShareLinks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    loadShareLinks();
  }, []);

  /** ===== 表示用 ===== */
  const timeLabel = (t, s, e) =>
    t === "allday"
      ? "終日"
      : t === "morning"
      ? "午前"
      : t === "afternoon"
      ? "午後"
      : `${s ?? "—"}〜${e ?? "—"}`;

  const prevMonth = () => setCurrent(new Date(y, m - 1, 1));
  const nextMonth = () => setCurrent(new Date(y, m + 1, 1));

  /** ===== JSX ===== */
  return (
    <div className="personal-page">
      <h1 className="page-title">個人日程登録</h1>

      <input
        className="title-input"
        type="text"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="memo-input"
        placeholder="メモを入力してください"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />

      {/* モード切替 */}
      <div className="select-mode">
        {[
          { key: "single", label: "単日選択" },
          { key: "range", label: "範囲選択" },
          { key: "multiple", label: "複数選択" },
        ].map((b) => (
          <button
            key={b.key}
            className={mode === b.key ? "active" : ""}
            onClick={() => {
              setMode(b.key);
              setSelectedDates(new Set());
              setDateOptions({});
              setRangeStart(null);
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="calendar-list-container">
        {/* カレンダー */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button aria-label="prev month" onClick={prevMonth}>
              ‹
            </button>
            <span>
              {y}年 {m + 1}月
            </span>
            <button aria-label="next month" onClick={nextMonth}>
              ›
            </button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                {weekdayHeaders.map((w, i) => (
                  <th key={w} className={weekdayClass(i)}>
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => {
                    if (cell === null)
                      return <td key={`e-${rIdx}-${cIdx}`} className="cell" />;
                    const dateStr = ymdd(y, m, cell);
                    const weekday = (firstWeekday + rIdx * 7 + cIdx) % 7;
                    const classes = ["cell", weekdayClass(weekday)];
                    const hName = holidayName(y, m, cell);
                    if (hName) classes.push("holiday");
                    if (isToday(y, m, cell)) classes.push("today");
                    if (isSelected(y, m, cell)) classes.push("selected");

                    return (
                      <td
                        key={dateStr}
                        className={classes.join(" ")}
                        onClick={() => handleCellClick(y, m, cell)}
                      >
                        <div>{cell}</div>
                        {hName && <div className="holiday-name">{hName}</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* サイドパネル */}
        <aside className="side-panel">
          <div>
            <h2>選択中の日程</h2>
            {selectedDates.size === 0 ? (
              <div className="date-card">
                <div className="date-label">未選択</div>
              </div>
            ) : (
              Array.from(selectedDates)
                .sort()
                .map((d) => {
                  const opt =
                    dateOptions[d] || {
                      timeType: "allday",
                      startTime: null,
                      endTime: null,
                    };
                  return (
                    <div className="date-card" key={d}>
                      <div className="date-label">{d}</div>
                      <div className="time-options">
                        {[
                          { k: "allday", t: "終日" },
                          { k: "morning", t: "午前" },
                          { k: "afternoon", t: "午後" },
                          { k: "custom", t: "時間指定" },
                        ].map((o) => (
                          <button
                            key={o.k}
                            className={`time-btn ${
                              opt.timeType === o.k ? "active" : ""
                            }`}
                            onClick={() => setTimeTypeForDate(d, o.k)}
                          >
                            {o.t}
                          </button>
                        ))}
                      </div>
                      {opt.timeType === "custom" && (
                        <div className="time-range">
                          <select
                            className="cute-select"
                            value={opt.startTime || "09:00"}
                            onChange={(e) => setStartForDate(d, e.target.value)}
                          >
                            {timeOptions1h.map((t) => (
                              <option key={`s-${d}-${t}`} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <span className="time-separator">〜</span>
                          <select
                            className="cute-select"
                            value={opt.endTime || "18:00"}
                            onChange={(e) => setEndForDate(d, e.target.value)}
                          >
                            {timeOptions1h.map((t) => (
                              <option key={`e-${d}-${t}`} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
          <button className="register-btn" onClick={handleRegister}>
            登録
          </button>
        </aside>
      </div>

      {/* 登録済み予定 */}
      <section className="registered-list">
        <h2 className="schedule-header">登録済みスケジュール</h2>
        {schedules.length === 0 ? (
          <div className="schedule-card">まだ予定はありません</div>
        ) : (
          schedules.map((s) => (
            <div className="schedule-card" key={s.id}>
              <div className="schedule-header">
                {s.date} / {timeLabel(s.timeType, s.startTime, s.endTime)}
              </div>
              <div>
                <strong>{s.title}</strong>
              </div>
              {s.memo && <div style={{ marginTop: 4 }}>{s.memo}</div>}
            </div>
          ))
        )}
      </section>

      {/* Discord共有リンク（自動表示） */}
      <section className="registered-list">
        <h2 className="schedule-header">Discord 共有リンク（閲覧のみ）</h2>
        {shareLinks.length === 0 ? (
          <div className="schedule-card">共有リンクを準備中...</div>
        ) : (
          shareLinks.map((l) => (
            <div className="schedule-card" key={l.id}>
              <div className="schedule-header">
                {l.title || "個人スケジュール"} / {l.discordUser}
              </div>
              <div>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#fff", textDecoration: "underline" }}
                >
                  {l.url}
                </a>
              </div>
              {l.createdAt && (
                <div style={{ opacity: 0.8, marginTop: 6 }}>
                  発行日時: {new Date(l.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
