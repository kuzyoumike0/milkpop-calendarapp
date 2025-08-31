import React, { useMemo, useState } from "react";
import Holidays from "date-holidays";
import "../personal.css";

/**
 * 個人日程登録ページ
 * - モード切替: 単日/範囲/複数
 * - 今日(日本時間)の強調
 * - 選択中日程：終日/午前/午後/時間指定（時間指定は1時間刻みプルダウン）
 * - 祝日表示（日本）
 */
export default function PersonalPage() {
  /** ===================== ユーティリティ ===================== */
  const pad2 = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const ymdd = (Y, M, D) => `${Y}-${pad2(M + 1)}-${pad2(D)}`;

  // “今日”を日本時間で判定（JST=UTC+9）
  const todayJST = (() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const jst = new Date(utc + 9 * 60 * 60000);
    return ymd(jst);
  })();

  /** ===================== 状態 ===================== */
  // 表示中の年月
  const [current, setCurrent] = useState(() => {
    const jst = new Date(new Date().getTime() + (-new Date().getTimezoneOffset() + 540) * 60000);
    return new Date(jst.getFullYear(), jst.getMonth(), 1);
  });

  // タイトル / メモ
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  // 選択モード: single | range | multiple
  const [mode, setMode] = useState("single");
  const [rangeStart, setRangeStart] = useState(null); // 1回目クリック保持（yyyy-mm-dd）
  const [selectedDates, setSelectedDates] = useState(new Set()); // yyyy-mm-dd の集合

  // 時間帯: allday | morning | afternoon | night?（要件は午前・午後・終日・時間指定）
  // 仕様に忠実に「終日(allday) / 午前(morning) / 午後(afternoon) / 時間指定(custom)」
  const [timeType, setTimeType] = useState("allday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  // 登録済み（ローカル即時反映）
  const [schedules, setSchedules] = useState([]);

  // 祝日（日本）
  const hd = useMemo(() => new Holidays("JP"), []);

  /** ===================== カレンダー派生値 ===================== */
  const y = current.getFullYear();
  const m = current.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay(); // 0=Sun
  const weekdayHeaders = ["日", "月", "火", "水", "木", "金", "土"];

  // 1時間刻み 00:00〜24:00
  const timeOptions = useMemo(() => {
    const arr = [];
    for (let h = 0; h <= 24; h++) arr.push(`${pad2(h)}:00`);
    return arr;
  }, []);

  /** ===================== 祝日/クラス ===================== */
  const holidayName = (Y, M, D) => {
    const info = hd.isHoliday(new Date(Y, M, D));
    return info ? info[0]?.name : null;
  };
  const isToday = (Y, M, D) => ymdd(Y, M, D) === todayJST;
  const isSelected = (Y, M, D) => selectedDates.has(ymdd(Y, M, D));
  const weekdayClass = (w) => (w === 0 ? "sunday" : w === 6 ? "saturday" : "");

  /** ===================== モード別クリック処理 ===================== */
  const selectSingle = (dateStr) => setSelectedDates(new Set([dateStr]));

  const toggleMultiple = (dateStr) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
      return next;
    });
  };

  const selectRange = (dateStr) => {
    if (!rangeStart) {
      setRangeStart(dateStr);
      setSelectedDates(new Set([dateStr]));
      return;
    }
    const a = new Date(rangeStart);
    const b = new Date(dateStr);
    const start = a <= b ? a : b;
    const end = a <= b ? b : a;

    const next = new Set();
    const cur = new Date(start);
    while (cur <= end) {
      next.add(ymd(cur));
      cur.setDate(cur.getDate() + 1);
    }
    setSelectedDates(next);
    setRangeStart(null);
  };

  const handleCellClick = (Y, M, D) => {
    const dateStr = ymdd(Y, M, D);
    if (mode === "single") selectSingle(dateStr);
    else if (mode === "multiple") toggleMultiple(dateStr);
    else if (mode === "range") selectRange(dateStr);
  };

  /** ===================== カレンダー行列 ===================== */
  const matrix = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [firstWeekday, daysInMonth]);

  /** ===================== 登録 ===================== */
  const handleRegister = () => {
    if (!title.trim() || selectedDates.size === 0) return;

    const newItems = Array.from(selectedDates)
      .sort()
      .map((date) => ({
        id: `${date}-${Date.now()}`,
        date,
        title: title.trim(),
        memo: memo.trim(),
        timeType,
        startTime: timeType === "custom" ? startTime : null,
        endTime: timeType === "custom" ? endTime : null,
      }));

    const merged = [...schedules, ...newItems].sort((a, b) => (a.date < b.date ? -1 : 1));
    setSchedules(merged);

    // 画面に残したい入力は残す。選択だけリセット
    setSelectedDates(new Set());
    setRangeStart(null);
  };

  /** ===================== 時間帯ラベル ===================== */
  const timeLabel = (t, s, e) => {
    if (t === "allday") return "終日";
    if (t === "morning") return "午前";
    if (t === "afternoon") return "午後";
    if (t === "custom") return `${s}〜${e}`;
    return "";
  };

  /** ===================== 月移動 ===================== */
  const prevMonth = () => setCurrent(new Date(y, m - 1, 1));
  const nextMonth = () => setCurrent(new Date(y, m + 1, 1));

  /** ===================== JSX ===================== */
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

      {/* モード切替（単日 / 範囲選択 / 複数選択） */}
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
              setRangeStart(null);
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* カレンダー + 右サイド */}
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
                    if (cell === null) return <td key={`e-${rIdx}-${cIdx}`} className="cell" />;
                    const dateStr = ymdd(y, m, cell);
                    const weekday = (firstWeekday + rIdx * 7 + cIdx) % 7;
                    const classes = ["cell", weekdayClass(weekday)];
                    const hName = holidayName(y, m, cell);

                    if (hName) classes.push("holiday");
                    if (isToday(y, m, cell)) classes.push("today"); // ← 日本時間の今日を強調
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

        {/* 右サイド：選択中の日程 + 時間帯 + 登録ボタン */}
        <aside className="side-panel">
          <div>
            <h2>選択中の日程</h2>

            {selectedDates.size === 0 ? (
              <div className="date-card">
                <div className="date-label">未選択</div>
                <div style={{ opacity: 0.85 }}>
                  {mode === "range"
                    ? "開始日 → 終了日の順でクリックしてください"
                    : mode === "multiple"
                    ? "複数日をクリックで選択/解除できます"
                    : "カレンダーから1日選択してください"}
                </div>
              </div>
            ) : (
              Array.from(selectedDates)
                .sort()
                .map((d) => (
                  <div className="date-card" key={d}>
                    <div className="date-label">{d}</div>
                    <div style={{ opacity: 0.9 }}>{timeLabel(timeType, startTime, endTime)}</div>
                  </div>
                ))
            )}
          </div>

          {/* 時間帯ボタン */}
          <div>
            <h2>時間帯</h2>
            <div className="time-options">
              {[
                { k: "allday", t: "終日" },
                { k: "morning", t: "午前" },
                { k: "afternoon", t: "午後" },
                { k: "custom", t: "時間指定" },
              ].map((opt) => (
                <button
                  key={opt.k}
                  className={`time-btn ${timeType === opt.k ? "active" : ""}`}
                  onClick={() => setTimeType(opt.k)}
                >
                  {opt.t}
                </button>
              ))}
            </div>

            {/* 時間指定の場合のみ、1時間刻みプルダウン表示 */}
            {timeType === "custom" && (
              <div className="time-range">
                <select
                  className="cute-select"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {timeOptions.map((t) => (
                    <option key={`s-${t}`} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span className="time-separator">〜</span>
                <select
                  className="cute-select"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  {timeOptions.map((t) => (
                    <option key={`e-${t}`} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button className="register-btn" onClick={handleRegister}>
            登録
          </button>
        </aside>
      </div>

      {/* 画面下の登録済み一覧（中央寄せカード） */}
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
    </div>
  );
}
