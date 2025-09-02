// frontend/src/components/PersonalPage.jsx
import React, { useMemo, useRef, useState } from "react";
import "../personal.css"; // personal.css を適用

/* ========================= ユーティリティ ========================= */
const pad = (n) => String(n).padStart(2, "0");
const fmt = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const wdJP = ["日", "月", "火", "水", "木", "金", "土"];
const todayStr = (() => {
  const t = new Date();
  return fmt(t.getFullYear(), t.getMonth() + 1, t.getDate());
})();

function nthMonday(year, month, n) {
  const first = new Date(year, month - 1, 1);
  const offset = (8 - first.getDay()) % 7; // 最初の月曜までの差
  return fmt(year, month, 1 + offset + 7 * (n - 1));
}

// 春分・秋分（必要年を追加して運用）
const EQUINOX = {
  vernal: { 2024: "2024-03-20", 2025: "2025-03-20", 2026: "2026-03-20" },
  autumnal: { 2024: "2024-09-22", 2025: "2025-09-23", 2026: "2026-09-22" },
};

function buildJapaneseHolidays(year) {
  const map = new Map();
  map.set(fmt(year, 1, 1), "元日");
  map.set(nthMonday(year, 1, 2), "成人の日");
  map.set(fmt(year, 2, 11), "建国記念の日");
  map.set(fmt(year, 2, 23), "天皇誕生日");
  if (EQUINOX.vernal[year]) map.set(EQUINOX.vernal[year], "春分の日");
  map.set(fmt(year, 4, 29), "昭和の日");
  map.set(fmt(year, 5, 3), "憲法記念日");
  map.set(fmt(year, 5, 4), "みどりの日");
  map.set(fmt(year, 5, 5), "こどもの日");
  map.set(nthMonday(year, 7, 3), "海の日");
  map.set(fmt(year, 8, 11), "山の日");
  map.set(nthMonday(year, 9, 3), "敬老の日");
  if (EQUINOX.autumnal[year]) map.set(EQUINOX.autumnal[year], "秋分の日");
  map.set(nthMonday(year, 10, 2), "スポーツの日");
  map.set(fmt(year, 11, 3), "文化の日");
  map.set(fmt(year, 11, 23), "勤労感謝の日");

  const isHoliday = (dstr) => map.has(dstr);
  const nextDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

  // 振替休日
  for (const [dstr] of Array.from(map)) {
    const d = new Date(dstr);
    if (d.getDay() === 0) {
      let cur = nextDay(d);
      while (isHoliday(fmt(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()))) {
        cur = nextDay(cur);
      }
      map.set(fmt(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()), "振替休日");
    }
  }
  // 国民の休日（祝日に挟まれた平日）
  const dates = Array.from(map.keys()).sort();
  for (let i = 0; i < dates.length - 1; i++) {
    const a = new Date(dates[i]);
    const b = new Date(dates[i + 1]);
    if ((b - a) / 86400000 === 2) {
      const mid = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1);
      const midStr = fmt(mid.getFullYear(), mid.getMonth() + 1, mid.getDate());
      if (!map.has(midStr) && mid.getDay() !== 0) map.set(midStr, "国民の休日");
    }
  }
  return map;
}

function buildMonthMatrix(year, month) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0).getDate();
  const pre = Array.from({ length: first.getDay() }, () => null);
  const days = Array.from({ length: last }, (_, i) => i + 1);
  const cells = [...pre, ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/* ========================= メイン ========================= */
export default function PersonalPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState(""); // ★ 修正：const で定義

  const [mode, setMode] = useState("single"); // single | range | multi
  const rangeStartRef = useRef(null);
  const [selected, setSelected] = useState(new Set()); // 'YYYY-MM-DD'

  const [timePreset, setTimePreset] = useState("allday"); // allday | day | night | custom
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(18);

  const [records, setRecords] = useState([]); // {id,title,memo,items:[{date,slot,startHour,endHour}],createdAt}
  const [editingId, setEditingId] = useState(null);

  const holidayMap = useMemo(() => buildJapaneseHolidays(year), [year]);
  const weeks = useMemo(() => buildMonthMatrix(year, month), [year, month]);

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };
  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  const onCellClick = (d) => {
    if (!d) return;
    const dateStr = fmt(year, month, d);

    if (mode === "single") {
      setSelected(new Set([dateStr]));
      rangeStartRef.current = null;
      return;
    }
    if (mode === "multi") {
      setSelected((prev) => {
        const s = new Set(prev);
        s.has(dateStr) ? s.delete(dateStr) : s.add(dateStr);
        return s;
      });
      return;
    }
    // range
    if (!rangeStartRef.current) {
      rangeStartRef.current = dateStr;
      setSelected(new Set([dateStr]));
    } else {
      let a = new Date(rangeStartRef.current);
      let b = new Date(dateStr);
      if (a > b) [a, b] = [b, a];
      const s = new Set();
      for (let cur = new Date(a); cur <= b; cur.setDate(cur.getDate() + 1)) {
        s.add(fmt(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()));
      }
      setSelected(s);
      rangeStartRef.current = null;
    }
  };

  const holidayName = (y, m, d) => holidayMap.get(fmt(y, m, d));
  const isToday = (d) => fmt(year, month, d) === todayStr;
  const isSelected = (d) => selected.has(fmt(year, month, d));
  const dayClass = (y, m, d) => {
    const dow = new Date(y, m - 1, d).getDay();
    return dow === 0 ? "sunday" : dow === 6 ? "saturday" : "";
  };

  const slotLabel = useMemo(() => {
    switch (timePreset) {
      case "allday":
        return "終日";
      case "day":
        return "昼";
      case "night":
        return "夜";
      case "custom":
        return `${startHour}時〜${endHour}時`;
      default:
        return "";
    }
  }, [timePreset, startHour, endHour]);

  const onRegister = () => {
    if (selected.size === 0) return;

    const items = Array.from(selected)
      .sort()
      .map((date) => ({
        date,
        slot: slotLabel,
        startHour: timePreset === "custom" ? startHour : null,
        endHour: timePreset === "custom" ? endHour : null,
      }));

    if (editingId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, title: title || "（無題）", memo, items } : r
        )
      );
      setEditingId(null);
    } else {
      const id = `${Date.now()}${Math.random().toString(16).slice(2, 7)}`;
      setRecords((prev) => [
        {
          id,
          title: title || "（無題）",
          memo,
          items,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setSelected(new Set());
  };

  const onEdit = (rec) => {
    setEditingId(rec.id);
    setTitle(rec.title === "（無題）" ? "" : rec.title);
    setMemo(rec.memo || "");

    const firstSlot = rec.items[0]?.slot || "終日";
    if (firstSlot === "終日") setTimePreset("allday");
    else if (firstSlot === "昼") setTimePreset("day");
    else if (firstSlot === "夜") setTimePreset("night");
    else {
      const m = firstSlot.match(/^(\d+)時〜(\d+)時$/);
      if (m) {
        setTimePreset("custom");
        setStartHour(Number(m[1]));
        setEndHour(Number(m[2]));
      } else setTimePreset("allday");
    }

    const s = new Set(rec.items.map((i) => i.date));
    setSelected(s);

    const first = rec.items[0]?.date;
    if (first) {
      const d = new Date(first);
      setYear(d.getFullYear());
      setMonth(d.getMonth() + 1);
    }
  };

  const onDelete = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setSelected(new Set());
    }
  };

  // 個人日程共有専用（/share/:token）
  const onShare = (rec) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/share/${rec.id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    alert(`共有リンクを作成しました。\n${url}\n\n（/share/:token は個人日程共有専用）`);
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  /* ========================= JSX ========================= */
  return (
    <div className="personal-page">
      {/* タイトル */}
      <h1 className="page-title">個人日程登録</h1>

      {/* 入力欄 */}
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
        <button
          className={mode === "single" ? "active" : ""}
          onClick={() => {
            setMode("single");
            rangeStartRef.current = null;
          }}
        >
          単日選択
        </button>
        <button
          className={mode === "range" ? "active" : ""}
          onClick={() => {
            setMode("range");
            rangeStartRef.current = null;
          }}
        >
          範囲選択
        </button>
        <button
          className={mode === "multi" ? "active" : ""}
          onClick={() => {
            setMode("multi");
            rangeStartRef.current = null;
          }}
        >
          複数選択
        </button>
      </div>

      {/* カレンダー + サイド */}
      <div className="calendar-list-container">
        {/* カレンダー */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={prevMonth}>‹</button>
            <span>
              {year}年 {month}月
            </span>
            <button onClick={nextMonth}>›</button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                {wdJP.map((w, i) => (
                  <th key={w} className={i === 0 ? "sunday" : i === 6 ? "saturday" : ""}>
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((d, di) => {
                    if (!d) return <td key={`e-${di}`} />;
                    const classes = [
                      "cell",
                      dayClass(year, month, d),
                      isToday(d) ? "today" : "",
                      isSelected(d) ? "selected" : "",
                      holidayName(year, month, d) ? "holiday" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    const hname = holidayName(year, month, d);
                    return (
                      <td key={d} className={classes} onClick={() => onCellClick(d)}>
                        <div style={{ fontWeight: 700 }}>{d}</div>
                        {hname && <div className="holiday-name">{hname}</div>}
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
          <h2>選択中の日程</h2>

          <div className="date-card">
            <div className="date-label">
              {selected.size ? `${selected.size}日 選択中` : "未選択"}
            </div>
            {selected.size > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Array.from(selected)
                  .sort()
                  .map((d) => (
                    <span
                      key={d}
                      className="time-btn active"
                      style={{ borderRadius: 14, padding: "4px 10px" }}
                    >
                      {d}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* 時間帯プリセット */}
          <div className="time-options">
            <button
              className={`time-btn ${timePreset === "allday" ? "active" : ""}`}
              onClick={() => setTimePreset("allday")}
            >
              終日
            </button>
            <button
              className={`time-btn ${timePreset === "day" ? "active" : ""}`}
              onClick={() => setTimePreset("day")}
            >
              昼
            </button>
            <button
              className={`time-btn ${timePreset === "night" ? "active" : ""}`}
              onClick={() => setTimePreset("night")}
            >
              夜
            </button>
            <button
              className={`time-btn ${timePreset === "custom" ? "active" : ""}`}
              onClick={() => setTimePreset("custom")}
            >
              カスタム
            </button>
          </div>

          {/* カスタム時間帯 */}
          {timePreset === "custom" && (
            <div className="time-range">
              <select
                className="cute-select"
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>
                    {h}時
                  </option>
                ))}
              </select>
              <span className="time-separator">〜</span>
              <select
                className="cute-select"
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>
                    {h}時
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="register-btn" onClick={onRegister}>
            {editingId ? "更新する" : "登録"}
          </button>
        </aside>
      </div>

      {/* 登録済みリスト */}
      <section className="registered-list">
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>あなたの個人日程（保存済み）</h2>

        {records.length === 0 && <p style={{ opacity: 0.85 }}>まだ登録はありません。</p>}

        {records.map((rec) => (
          <div key={rec.id} className="schedule-card">
            <div className="schedule-header">
              {rec.title}{" "}
              <span style={{ opacity: 0.7, fontWeight: 400, marginLeft: 8 }}>
                （作成日時: {new Date(rec.createdAt || Date.now()).toLocaleString("ja-JP")}）
              </span>
            </div>

            {rec.memo && <div style={{ marginBottom: 6 }}>〈メモ〉{rec.memo}</div>}

            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {rec.items.map((it, i) => (
                <li key={i}>
                  {it.date} / {it.slot}
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
              <button className="time-btn" onClick={() => onEdit(rec)}>編集</button>
              <button className="time-btn" onClick={() => onDelete(rec.id)}>削除</button>
              <button className="time-btn" onClick={() => onShare(rec)}>共有</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
