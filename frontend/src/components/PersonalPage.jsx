// frontend/src/components/PersonalPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/** ============ ユーティリティ ============ */
const pad = (n) => String(n).padStart(2, "0");
const fmt = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const todayStr = (() => {
  const t = new Date();
  return fmt(t.getFullYear(), t.getMonth() + 1, t.getDate());
})();
const wdJP = ["日", "月", "火", "水", "木", "金", "土"];

/** n番目の月曜（祝日計算） */
function nthMonday(year, month, n) {
  const first = new Date(year, month - 1, 1);
  const firstDow = first.getDay(); // 0=Sun
  const offset = (8 - firstDow) % 7; // 最初の月曜までの差
  const date = 1 + offset + 7 * (n - 1);
  return fmt(year, month, date);
}

/** 春分・秋分（近年のみテーブル化。必要年は随時追加） */
const EQUINOX = {
  vernal: {
    2024: "2024-03-20",
    2025: "2025-03-20",
    2026: "2026-03-20",
  },
  autumnal: {
    2024: "2024-09-22",
    2025: "2025-09-23",
    2026: "2026-09-22",
  },
};

/** 年ごとの祝日マップ（YYYY-MM-DD -> 名称）。振替休日にも対応 */
function buildJapaneseHolidays(year) {
  const map = new Map();

  // 固定日
  map.set(fmt(year, 1, 1), "元日");
  map.set(nthMonday(year, 1, 2), "成人の日"); // 1月第2月曜
  map.set(fmt(year, 2, 11), "建国記念の日");
  map.set(fmt(year, 2, 23), "天皇誕生日");
  if (EQUINOX.vernal[year]) map.set(EQUINOX.vernal[year], "春分の日");
  map.set(fmt(year, 4, 29), "昭和の日");
  map.set(fmt(year, 5, 3), "憲法記念日");
  map.set(fmt(year, 5, 4), "みどりの日");
  map.set(fmt(year, 5, 5), "こどもの日");
  map.set(nthMonday(year, 7, 3), "海の日"); // 7月第3月曜
  map.set(fmt(year, 8, 11), "山の日");
  map.set(nthMonday(year, 9, 3), "敬老の日"); // 9月第3月曜
  if (EQUINOX.autumnal[year]) map.set(EQUINOX.autumnal[year], "秋分の日");
  map.set(nthMonday(year, 10, 2), "スポーツの日"); // 10月第2月曜
  map.set(fmt(year, 11, 3), "文化の日");
  map.set(fmt(year, 11, 23), "勤労感謝の日");

  // 振替休日（祝日が日曜日なら翌平日まで順延）
  const isHoliday = (dstr) => map.has(dstr);
  const nextDay = (d) => {
    const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    return nd;
  };

  for (const [dstr] of Array.from(map)) {
    const d = new Date(dstr);
    if (d.getDay() === 0) {
      // 日曜
      let cur = nextDay(d);
      // 連続で休日なら、平日になるまで進める
      while (isHoliday(fmt(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()))) {
        cur = nextDay(cur);
      }
      map.set(fmt(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()), "振替休日");
    }
  }

  // 国民の休日（祝日に挟まれた平日が対象）：簡易対応
  // 例: 祝日 A - 平日 X - 祝日 B → X を国民の休日
  const dates = Array.from(map.keys()).sort();
  for (let i = 0; i < dates.length - 1; i++) {
    const a = new Date(dates[i]);
    const b = new Date(dates[i + 1]);
    const diff = (b - a) / (24 * 3600 * 1000);
    if (diff === 2) {
      const mid = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1);
      const midStr = fmt(mid.getFullYear(), mid.getMonth() + 1, mid.getDate());
      if (!map.has(midStr) && mid.getDay() !== 0) {
        map.set(midStr, "国民の休日");
      }
    }
  }

  return map;
}

/** 月のカレンダーマトリクスを生成（先頭は日曜）。空白は null */
function buildMonthMatrix(year, month) {
  const first = new Date(year, month - 1, 1);
  const firstDow = first.getDay();
  const last = new Date(year, month, 0).getDate();

  const cells = [];
  // 1: 先行空白
  for (let i = 0; i < firstDow; i++) cells.push(null);
  // 2: 日付
  for (let d = 1; d <= last; d++) cells.push(d);
  // 3: 後ろ詰め
  while (cells.length % 7 !== 0) cells.push(null);

  // 2次元（週）に分割
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/** ============ メインコンポーネント ============ */
export default function PersonalPage() {
  // 表示年月
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // 入力
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  // モード: single/range/multi
  const [mode, setMode] = useState("single");
  const rangeStartRef = useRef(null);

  // 選択日
  const [selected, setSelected] = useState(new Set()); // 'YYYY-MM-DD'

  // 時間帯
  const [timePreset, setTimePreset] = useState("allday"); // 'allday'|'day'|'night'|'custom'
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(18);

  // 登録済み
  const [records, setRecords] = useState([]); // [{id, title, memo, items:[{date, slot, startHour,endHour}], createdAt}]
  const [editingId, setEditingId] = useState(null);

  // 祝日（年が変わるたびに計算）
  const holidayMap = useMemo(() => buildJapaneseHolidays(year), [year]);

  const weeks = useMemo(() => buildMonthMatrix(year, month), [year, month]);

  /** 月の移動 */
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

  /** 日クリック処理 */
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
        if (s.has(dateStr)) s.delete(dateStr);
        else s.add(dateStr);
        return s;
      });
      return;
    }

    if (mode === "range") {
      if (!rangeStartRef.current) {
        rangeStartRef.current = dateStr;
        setSelected(new Set([dateStr]));
      } else {
        // 範囲化
        const start = new Date(rangeStartRef.current);
        const end = new Date(dateStr);
        if (start > end) {
          const tmp = new Date(start);
          start.setTime(end.getTime());
          end.setTime(tmp.getTime());
        }
        const s = new Set();
        for (
          let cur = new Date(start);
          cur <= end;
          cur.setDate(cur.getDate() + 1)
        ) {
          s.add(fmt(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()));
        }
        setSelected(s);
        rangeStartRef.current = null;
      }
    }
  };

  /** 選択エリアの時間帯ラベル */
  const currentSlotLabel = useMemo(() => {
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

  /** 登録 */
  const onRegister = () => {
    if (selected.size === 0) return;

    const items = Array.from(selected)
      .sort()
      .map((date) => ({
        date,
        slot: currentSlotLabel,
        startHour: timePreset === "custom" ? startHour : null,
        endHour: timePreset === "custom" ? endHour : null,
      }));

    if (editingId) {
      // 更新
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, title: title || "（無題）", memo, items }
            : r
        )
      );
      setEditingId(null);
    } else {
      // 新規
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

    // 選択クリア
    setSelected(new Set());
  };

  /** 編集開始 */
  const onEdit = (rec) => {
    setEditingId(rec.id);
    setTitle(rec.title === "（無題）" ? "" : rec.title);
    setMemo(rec.memo || "");
    // 1件目のスロットから preset を決める（完全一致で簡易判定）
    const slot = rec.items[0]?.slot || "終日";
    if (slot === "終日") setTimePreset("allday");
    else if (slot === "昼") setTimePreset("day");
    else if (slot === "夜") setTimePreset("night");
    else {
      // "X時〜Y時"
      const m = slot.match(/^(\d+)時〜(\d+)時$/);
      if (m) {
        setTimePreset("custom");
        setStartHour(Number(m[1]));
        setEndHour(Number(m[2]));
      } else {
        setTimePreset("allday");
      }
    }

    // 選択日を復元
    const s = new Set(rec.items.map((i) => i.date));
    setSelected(s);

    // 表示月を調整（最初の一日が含まれる月へ）
    const first = rec.items[0]?.date;
    if (first) {
      const d = new Date(first);
      setYear(d.getFullYear());
      setMonth(d.getMonth() + 1);
    }
  };

  /** 削除 */
  const onDelete = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setSelected(new Set());
    }
  };

  /** 共有リンク作成（個人日程共有専用 /share/:token） */
  const onShare = (rec) => {
    const origin =
      typeof window !== "undefined" && window.location
        ? window.location.origin
        : "";
    const url = `${origin}/share/${rec.id}`;
    // クリップボードにコピー（無言失敗は無視）
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    alert(`共有リンクを作成しました\n${url}\n\n（/share/:token は個人日程共有専用ページです）`);
  };

  /** その日が祝日か？ */
  const holidayName = (y, m, d) => {
    const key = fmt(y, m, d);
    return holidayMap.get(key);
  };

  /** 曜日クラス */
  const dayClass = (y, m, d) => {
    const dt = new Date(y, m - 1, d);
    const dow = dt.getDay();
    if (dow === 0) return "sunday";
    if (dow === 6) return "saturday";
    return "";
  };

  /** セル選択状態 */
  const isSelected = (d) => selected.has(fmt(year, month, d));

  /** 今日判定 */
  const isToday = (d) => fmt(year, month, d) === todayStr;

  /** 時刻セレクト用 */
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

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
          {/* ヘッダー */}
          <div className="calendar-header">
            <button onClick={prevMonth}>‹</button>
            <span>
              {year}年 {month}月
            </span>
            <button onClick={nextMonth}>›</button>
          </div>

          {/* 曜日ヘッダ */}
          <table className="calendar-table">
            <thead>
              <tr>
                {wdJP.map((w, idx) => (
                  <th key={w} className={idx === 0 ? "sunday" : idx === 6 ? "saturday" : ""}>
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
                      <td
                        key={d}
                        className={classes}
                        onClick={() => onCellClick(d)}
                      >
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

          {/* 日付ラベル（並び） */}
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

          {/* 時間帯（終日/昼/夜/カスタム） */}
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
              title="例: 08〜17時（保存はラベルのみ）"
            >
              昼
            </button>
            <button
              className={`time-btn ${timePreset === "night" ? "active" : ""}`}
              onClick={() => setTimePreset("night")}
              title="例: 17〜23時（保存はラベルのみ）"
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

          {/* 登録 */}
          <button className="register-btn" onClick={onRegister}>
            {editingId ? "更新する" : "登録"}
          </button>
        </aside>
      </div>

      {/* 登録済みリスト */}
      <section className="registered-list">
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>あなたの個人日程（保存済み）</h2>

        {records.length === 0 && (
          <p style={{ opacity: 0.85 }}>まだ登録はありません。</p>
        )}

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
