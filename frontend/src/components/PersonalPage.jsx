import React, { useMemo, useState } from "react";
import Holidays from "date-holidays";
import "../personal.css";

/**
 * 個人日程登録（1日ずつ：終日/午前/午後/時間指定 を設定可能）
 * - モード: 単日 / 範囲 / 複数
 * - 日本の祝日表示
 * - 日本時間の「今日」を強調
 * - 右側パネルで選択中の日付ごとに時間帯設定（時間指定時は1時間刻みのプルダウン）
 */
export default function PersonalPage() {
  /** ===== 共通ユーティリティ ===== */
  const pad2 = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const ymdd = (Y, M, D) => `${Y}-${pad2(M + 1)}-${pad2(D)}`;

  // 日本時間の今日（JST）
  const todayJST = (() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const jst = new Date(utc + 9 * 60 * 60000);
    return ymd(jst);
  })();

  /** ===== 状態 ===== */
  // 表示月（1日に固定）
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // 入力
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  // 選択モード
  const [mode, setMode] = useState("single"); // single | range | multiple
  const [rangeStart, setRangeStart] = useState(null); // yyyy-mm-dd or null

  // 選択された日付
  // Set: 表示・登録用の選択集合
  const [selectedDates, setSelectedDates] = useState(new Set());
  // Map: 日付ごとの時間帯設定 { [dateStr]: {timeType, startTime, endTime} }
  const [dateOptions, setDateOptions] = useState({}); // 例: { "2025-09-01": {timeType:"allday", startTime:null, endTime:null} }

  // 登録済みスケジュール（ローカル即時反映）
  const [schedules, setSchedules] = useState([]);

  // 祝日（日本）
  const hd = useMemo(() => new Holidays("JP"), []);

  /** ===== カレンダー派生値 ===== */
  const y = current.getFullYear();
  const m = current.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay(); // 0=Sun
  const weekdayHeaders = ["日", "月", "火", "水", "木", "金", "土"];

  // 1時間刻み 00:00〜24:00
  const timeOptions1h = useMemo(() => {
    const arr = [];
    for (let h = 0; h <= 24; h++) arr.push(`${pad2(h)}:00`);
    return arr;
  }, []);

  /** ===== 祝日/クラス ===== */
  const holidayName = (Y, M, D) => {
    const info = hd.isHoliday(new Date(Y, M, D));
    return info ? info[0]?.name : null;
  };
  const isToday = (Y, M, D) => ymdd(Y, M, D) === todayJST;
  const isSelected = (Y, M, D) => selectedDates.has(ymdd(Y, M, D));
  const weekdayClass = (w) => (w === 0 ? "sunday" : w === 6 ? "saturday" : "");

  /** ===== 選択集合・オプションの更新ヘルパ ===== */
  const ensureDefaultOption = (dateStr) => {
    // 初期は「終日」
    setDateOptions((prev) => {
      if (prev[dateStr]) return prev;
      return {
        ...prev,
        [dateStr]: { timeType: "allday", startTime: null, endTime: null },
      };
    });
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

  /** ===== モード別クリック処理 ===== */
  const handleCellClick = (Y, M, D) => {
    const dateStr = ymdd(Y, M, D);

    if (mode === "single") {
      setSelectedDates(new Set([dateStr]));
      setDateOptions((prev) => ({
        // single切替時は、既存設定があれば活かし、なければデフォルト設定を入れる
        [dateStr]: prev[dateStr] || { timeType: "allday", startTime: null, endTime: null },
      }));
      setRangeStart(null);
      return;
    }

    if (mode === "multiple") {
      if (selectedDates.has(dateStr)) removeDate(dateStr);
      else addDate(dateStr);
      return;
    }

    if (mode === "range") {
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
        if (!opts[ds]) opts[ds] = { timeType: "allday", startTime: null, endTime: null };
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

  /** ===== 時間帯のUI/更新（各日付ごと） ===== */
  const setTimeTypeForDate = (dateStr, t) => {
    setDateOptions((prev) => {
      const old = prev[dateStr] || { timeType: "allday", startTime: null, endTime: null };
      let startTime = old.startTime;
      let endTime = old.endTime;
      if (t !== "custom") {
        startTime = null;
        endTime = null;
      } else {
        // 初期値（未設定なら）
        startTime = startTime || "09:00";
        endTime = endTime || "18:00";
      }
      return { ...prev, [dateStr]: { timeType: t, startTime, endTime } };
    });
  };

  const setStartForDate = (dateStr, v) => {
    setDateOptions((prev) => {
      const old = prev[dateStr] || { timeType: "custom", startTime: null, endTime: null };
      return { ...prev, [dateStr]: { ...old, startTime: v, timeType: "custom" } };
    });
  };

  const setEndForDate = (dateStr, v) => {
    setDateOptions((prev) => {
      const old = prev[dateStr] || { timeType: "custom", startTime: null, endTime: null };
      return { ...prev, [dateStr]: { ...old, endTime: v, timeType: "custom" } };
    });
  };

  /** ===== 登録 ===== */
  const handleRegister = () => {
    if (!title.trim() || selectedDates.size === 0) return;

    const newItems = Array.from(selectedDates)
      .sort()
      .map((date) => {
        const opt = dateOptions[date] || { timeType: "allday", startTime: null, endTime: null };
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

    const merged = [...schedules, ...newItems].sort((a, b) => (a.date < b.date ? -1 : 1));
    setSchedules(merged);

    // 選択状態のみリセット（タイトル/メモは残す）
    setSelectedDates(new Set());
    setDateOptions({});
    setRangeStart(null);
  };

  /** ===== 時間帯ラベル ===== */
  const timeLabel = (t, s, e) => {
    if (t === "allday") return "終日";
    if (t === "morning") return "午前";
    if (t === "afternoon") return "午後";
    if (t === "custom") return `${s ?? "—"}〜${e ?? "—"}`;
    return "";
  };

  /** ===== 月移動 ===== */
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
                    if (cell === null) return <td key={`e-${rIdx}-${cIdx}`} className="cell" />;
                    const dateStr = ymdd(y, m, cell);
                    const weekday = (firstWeekday + rIdx * 7 + cIdx) % 7;
                    const classes = ["cell", weekdayClass(weekday)];
                    const hName = holidayName(y, m, cell);

                    if (hName) classes.push("holiday");
                    if (isToday(y, m, cell)) classes.push("today"); // 日本時間の今日を強調
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

        {/* 右サイド：選択中の日程ごとの時間帯設定 */}
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
                .map((d) => {
                  const opt = dateOptions[d] || { timeType: "allday", startTime: null, endTime: null };
                  return (
                    <div className="date-card" key={d}>
                      <div className="date-label">{d}</div>

                      {/* 各日付ごとの時間帯ボタン */}
                      <div className="time-options">
                        {[
                          { k: "allday", t: "終日" },
                          { k: "morning", t: "午前" },
                          { k: "afternoon", t: "午後" },
                          { k: "custom", t: "時間指定" },
                        ].map((o) => (
                          <button
                            key={o.k}
                            className={`time-btn ${opt.timeType === o.k ? "active" : ""}`}
                            onClick={() => setTimeTypeForDate(d, o.k)}
                          >
                            {o.t}
                          </button>
                        ))}
                      </div>

                      {/* 時間指定のときだけプルダウン */}
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

      {/* 画面下：登録済み一覧 */}
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
