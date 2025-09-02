// frontend/src/components/PersonalPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import Holidays from "date-holidays";
import "../personal.css";
import { createPersonalEvent, listPersonalEvents } from "../api";
import { Link } from "react-router-dom";

export default function PersonalPage() {
  // ===== ヘルパ =====
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

  // ===== 状態 =====
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [mode, setMode] = useState("single"); // single | range | multiple
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [dateOptions, setDateOptions] = useState({});
  const [schedules, setSchedules] = useState([]); // 即時反映用
  const [shareLinks, setShareLinks] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [loadingMyEvents, setLoadingMyEvents] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const hd = useMemo(() => new Holidays("JP"), []);

  // ===== カレンダー =====
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

  const holidayName = (Y, M, D) => {
    try {
      const info = hd.isHoliday(new Date(Y, M, D));
      return info ? info[0]?.name : null;
    } catch {
      return null;
    }
  };
  const isToday = (Y, M, D) => ymdd(Y, M, D) === todayJST;
  const isSelected = (Y, M, D) => selectedDates.has(ymdd(Y, M, D));
  const weekdayClass = (w) => (w === 0 ? "sunday" : w === 6 ? "saturday" : "");

  // ===== 選択 =====
  const ensureDefaultOption = (dateStr) => {
    setDateOptions((prev) =>
      prev[dateStr]
        ? prev
        : { ...prev, [dateStr]: { timeType: "allday", startTime: null, endTime: null } }
    );
  };
  const addDate = (dateStr) => {
    setSelectedDates((prev) => new Set(prev).add(dateStr));
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
      ensureDefaultOption(dateStr);
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

  const matrix = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [firstWeekday, daysInMonth]);

  const setTimeTypeForDate = (dateStr, t) => {
    setDateOptions((prev) => {
      const old = prev[dateStr] || { timeType: "allday" };
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
    setDateOptions((p) => ({ ...p, [dateStr]: { ...(p[dateStr] || {}), timeType: "custom", startTime: v } }));
  const setEndForDate = (dateStr, v) =>
    setDateOptions((p) => ({ ...p, [dateStr]: { ...(p[dateStr] || {}), timeType: "custom", endTime: v } }));

  // ===== 登録 =====
  const handleRegister = async () => {
    const safeTitle = title.trim() || "未設定タイトル";
    if (selectedDates.size === 0) {
      setErrorMsg("日付を選択してください。");
      return;
    }

    // 即時反映
    const newItems = Array.from(selectedDates).sort().map((date) => {
      const opt = dateOptions[date] || { timeType: "allday" };
      return {
        id: `${date}-${Date.now()}`,
        date,
        title: safeTitle,
        memo: memo.trim(),
        timeType: opt.timeType,
        startTime: opt.timeType === "custom" ? opt.startTime : null,
        endTime: opt.timeType === "custom" ? opt.endTime : null,
      };
    });
    setSchedules((prev) => [...prev, ...newItems]);

    setMyEvents((prev) => [
      ...prev,
      ...newItems.map((n) => ({
        id: `opt-${n.id}`,
        title: n.title,
        memo: n.memo,
        date: n.date,
        timeType: n.timeType,
        startTime: n.startTime,
        endTime: n.endTime,
        createdAt: new Date().toISOString(),
      })),
    ]);

    try {
      setLoading(true);
      const payload = Array.from(selectedDates).map((d) => {
        const opt = dateOptions[d] || { timeType: "allday" };
        return {
          date: d,
          timeType: opt.timeType,
          startTime: opt.timeType === "custom" ? opt.startTime : null,
          endTime: opt.timeType === "custom" ? opt.endTime : null,
        };
      });
      await createPersonalEvent({ title: safeTitle, memo: memo.trim(), dates: payload, options: {} });
      await Promise.all([loadShareLinks(), loadMyEvents()]);
    } catch (e) {
      setErrorMsg("登録に失敗しました");
    } finally {
      setLoading(false);
    }

    setSelectedDates(new Set());
    setDateOptions({});
    setRangeStart(null);
  };

  // ===== データ取得 =====
  const loadShareLinks = async () => {
    const base = window.location.origin;
    try {
      setLoadingShares(true);
      const res = await fetch("/api/schedules/mine", { credentials: "include" });
      const rows = res.ok ? await res.json() : [];
      setShareLinks(
        (rows || []).map((r) => ({
          id: r.id,
          title: r.title || "共有スケジュール",
          url: `${base}/share/${r.share_token}`,
          createdAt: r.created_at,
        }))
      );
    } finally {
      setLoadingShares(false);
    }
  };

  const loadMyEvents = async () => {
    try {
      setLoadingMyEvents(true);
      const list = await listPersonalEvents();
      const flattened = (list || []).flatMap((p) =>
        (p.dates || []).map((d) => ({
          id: `${p.id}-${d.date}`,
          title: p.title,
          memo: p.memo,
          date: d.date,
          timeType: d.timeType,
          startTime: d.startTime,
          endTime: d.endTime,
          createdAt: p.created_at,
        }))
      );
      setMyEvents(flattened);
    } finally {
      setLoadingMyEvents(false);
    }
  };

  useEffect(() => {
    Promise.all([loadShareLinks(), loadMyEvents()]);
  }, []);

  const timeLabel = (t, s, e) =>
    t === "allday" ? "終日" : t === "morning" ? "午前" : t === "afternoon" ? "午後" : `${s ?? "—"}〜${e ?? "—"}`;

  const prevMonth = () => setCurrent(new Date(y, m - 1, 1));
  const nextMonth = () => setCurrent(new Date(y, m + 1, 1));

  // ===== UI =====
  return (
    <div className="personal-page">
      <header className="banner">
        <div className="brand">MilkPOP Calendar</div>
        <nav className="nav">
          <a href="/">トップ</a>
          <a href="/register">日程登録</a>
          <a className="active" href="/personal">個人スケジュール</a>
        </nav>
      </header>

      <h1 className="page-title">個人日程登録</h1>

      <input className="title-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" />
      <textarea className="memo-input" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="メモ" />

      {/* モード切替 */}
      <div className="select-mode">
        {["single", "range", "multiple"].map((m) => (
          <button key={m} className={mode === m ? "active" : ""} onClick={() => { setMode(m); setSelectedDates(new Set()); }}>
            {m === "single" ? "単日" : m === "range" ? "範囲" : "複数"}
          </button>
        ))}
      </div>

      {/* カレンダー */}
      <div className="calendar-list-container">
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={prevMonth}>‹</button>
            <span>{y}年 {m + 1}月</span>
            <button onClick={nextMonth}>›</button>
          </div>
          <table className="calendar-table">
            <thead><tr>{weekdayHeaders.map((w, i) => <th key={w} className={weekdayClass(i)}>{w}</th>)}</tr></thead>
            <tbody>
              {matrix.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => {
                    if (!cell) return <td key={c}></td>;
                    const dateStr = ymdd(y, m, cell);
                    const classes = [weekdayClass((firstWeekday + r * 7 + c) % 7)];
                    if (holidayName(y, m, cell)) classes.push("holiday");
                    if (isToday(y, m, cell)) classes.push("today");
                    if (isSelected(y, m, cell)) classes.push("selected");
                    return <td key={c} className={classes.join(" ")} onClick={() => handleCellClick(y, m, cell)}>{cell}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="side-panel">
          <h2>選択中の日程</h2>
          {Array.from(selectedDates).map((d) => (
            <div key={d}>
              {d}
              <select onChange={(e) => setTimeTypeForDate(d, e.target.value)} value={dateOptions[d]?.timeType || "allday"}>
                <option value="allday">終日</option>
                <option value="morning">午前</option>
                <option value="afternoon">午後</option>
                <option value="custom">時間指定</option>
              </select>
              {dateOptions[d]?.timeType === "custom" && (
                <>
                  <select value={dateOptions[d]?.startTime || "09:00"} onChange={(e) => setStartForDate(d, e.target.value)}>
                    {timeOptions1h.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  〜
                  <select value={dateOptions[d]?.endTime || "18:00"} onChange={(e) => setEndForDate(d, e.target.value)}>
                    {timeOptions1h.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </>
              )}
            </div>
          ))}
          <button onClick={handleRegister} disabled={loading}>{loading ? "保存中..." : "登録"}</button>
          {errorMsg && <div className="error">{errorMsg}</div>}
        </aside>
      </div>

      <section className="registered-list">
        <h2>あなたの個人日程（保存済み）</h2>
        {loadingMyEvents ? "読み込み中..." : myEvents.map((e) => (
          <div key={e.id}>{e.date} / {timeLabel(e.timeType, e.startTime, e.endTime)} - {e.title}</div>
        ))}
      </section>

      <section className="registered-list">
        <h2>共有リンク一覧</h2>
        {loadingShares ? "読み込み中..." : shareLinks.map((l) => {
          const token = l.url.split("/share/")[1];
          return (
            <div key={l.id}>
              {l.title} <Link to={`/share/${token}`}>共有ページを開く</Link>
            </div>
          );
        })}
      </section>
    </div>
  );
}
