import React, { useMemo, useState, useEffect } from "react";
import Holidays from "date-holidays";
import api from "../api";
import "../personal.css";

export default function PersonalPage() {
  // ====== 状態 ======
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  // 選択モード: single | range | multiple
  const [mode, setMode] = useState("single");
  const [rangeStart, setRangeStart] = useState(null); // range開始一時保存
  const [selectedDates, setSelectedDates] = useState(new Set()); // yyyy-mm-dd の集合

  // 時間帯
  const [timeType, setTimeType] = useState("allday"); // allday | morning | afternoon | night | custom
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  // 登録済み
  const [schedules, setSchedules] = useState([]);

  // 祝日（日本）
  const hd = useMemo(() => new Holidays("JP"), []);

  // 初回ロード：個人予定一覧
  useEffect(() => {
    // API: GET /api/personal-schedules
    api
      .get("/api/personal-schedules")
      .then((data) => {
        // 想定レスポンス: [{id,date,title,memo,timeType,startTime,endTime}, ...]
        const arr = Array.isArray(data) ? data : [];
        arr.sort((a, b) => (a.date < b.date ? -1 : 1));
        setSchedules(arr);
      })
      .catch(() => {
        // 取得失敗時は空のままにしておく
      });
  }, []);

  // ====== 日付ユーティリティ ======
  const y = current.getFullYear();
  const m = current.getMonth(); // 0-11
  const todayStr = new Date().toISOString().split("T")[0];

  const pad2 = (n) => String(n).padStart(2, "0");
  const fmt = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const ymdd = (Y, M, D) => `${Y}-${pad2(M + 1)}-${pad2(D)}`;

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay(); // 0:Sun

  const weekHeaders = ["日", "月", "火", "水", "木", "金", "土"];

  // 時間帯ラベル
  const timeLabel = (item) => {
    const t = item?.timeType ?? timeType;
    const s = item?.startTime ?? startTime;
    const e = item?.endTime ?? endTime;
    switch (t) {
      case "allday":
        return "終日";
      case "morning":
        return "昼（09:00-18:00）";
      case "afternoon":
        return "午後（12:00-18:00）";
      case "night":
        return "夜（18:00-24:00）";
      case "custom":
        return `${s}〜${e}`;
      default:
        return "";
    }
  };

  // 時刻セレクトの選択肢（00:00～24:00）
  const timeOptions = useMemo(() => {
    const arr = [];
    for (let h = 0; h <= 24; h++) {
      const label = `${pad2(h)}:00`;
      arr.push(label);
    }
    return arr;
  }, []);

  // ====== 選択処理 ======
  const toggleDateMultiple = (dateStr) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const selectRange = (dateStr) => {
    // 1回目クリックで開始保存、2回目で範囲確定
    if (!rangeStart) {
      setRangeStart(dateStr);
      setSelectedDates(new Set([dateStr]));
      return;
    }
    const a = new Date(rangeStart);
    const b = new Date(dateStr);
    // 昇順に並べ直し
    const start = a <= b ? a : b;
    const end = a <= b ? b : a;

    const next = new Set();
    const cur = new Date(start);
    while (cur <= end) {
      next.add(fmt(cur));
      cur.setDate(cur.getDate() + 1);
    }
    setSelectedDates(next);
    setRangeStart(null); // 確定したのでリセット
  };

  const handleCellClick = (dateStr) => {
    if (!dateStr) return;
    if (mode === "single") {
      setSelectedDates(new Set([dateStr]));
    } else if (mode === "multiple") {
      toggleDateMultiple(dateStr);
    } else if (mode === "range") {
      selectRange(dateStr);
    }
  };

  // ====== 登録（API） ======
  const handleRegister = async () => {
    if (!title.trim() || selectedDates.size === 0) return;

    const payload = {
      // 一括登録API（バックエンドで配列を受け取る想定）
      items: Array.from(selectedDates).map((d) => ({
        date: d,
        title: title.trim(),
        memo: memo.trim(),
        timeType,
        startTime: timeType === "custom" ? startTime : null,
        endTime: timeType === "custom" ? endTime : null,
      })),
    };

    try {
      // API: POST /api/personal-schedules (→ 登録内容の配列を返す想定)
      const created = await api.post("/api/personal-schedules", payload);
      const list = Array.isArray(created) ? created : [];
      const merged = [...schedules, ...list].sort((a, b) => (a.date < b.date ? -1 : 1));
      setSchedules(merged);

      // 入力をクリア（タイトル維持したい場合は title を残してOK）
      setMemo("");
      setSelectedDates(new Set());
      setRangeStart(null);
    } catch (e) {
      console.error(e);
      // 失敗してもUIは維持
    }
  };

  // ====== カレンダー描画（テーブル） ======
  const buildCalendarMatrix = () => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  };

  const matrix = buildCalendarMatrix();

  // 祝日判定
  const getHoliday = (Y, M, D) => {
    const info = hd.isHoliday(new Date(Y, M, D));
    return info ? info[0]?.name : null;
  };

  // 今日判定/選択判定
  const isToday = (Y, M, D) => ymdd(Y, M, D) === todayStr;
  const isSelected = (Y, M, D) => selectedDates.has(ymdd(Y, M, D));

  // 曜日クラス
  const weekdayClass = (weekday) => {
    if (weekday === 0) return "sunday";
    if (weekday === 6) return "saturday";
    return "";
  };

  // ====== 月移動 ======
  const prevMonth = () => setCurrent(new Date(y, m - 1, 1));
  const nextMonth = () => setCurrent(new Date(y, m + 1, 1));

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
        {[
          { key: "single", label: "単日" },
          { key: "range", label: "範囲選択" },
          { key: "multiple", label: "複数選択" },
        ].map((btn) => (
          <button
            key={btn.key}
            className={mode === btn.key ? "active" : ""}
            onClick={() => {
              setMode(btn.key);
              setRangeStart(null);
              setSelectedDates(new Set());
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* カレンダー + サイド */}
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
                {["日", "月", "火", "水", "木", "金", "土"].map((w, idx) => (
                  <th key={w} className={weekdayClass(idx)}>
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
                    const holidayName = getHoliday(y, m, cell);

                    const classes = ["cell", weekdayClass(weekday)];
                    if (holidayName) classes.push("holiday");
                    if (isToday(y, m, cell)) classes.push("today");
                    if (isSelected(y, m, cell)) classes.push("selected");

                    return (
                      <td
                        key={dateStr}
                        className={classes.join(" ")}
                        onClick={() => handleCellClick(dateStr)}
                      >
                        <div>{cell}</div>
                        {holidayName && <div className="holiday-name">{holidayName}</div>}
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
                <div style={{ opacity: 0.8 }}>
                  {mode === "range"
                    ? "開始日 → 終了日の順にクリックしてください"
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
                    <div style={{ opacity: 0.85 }}>{timeLabel()}</div>
                  </div>
                ))
            )}
          </div>

          <div>
            <h2>時間帯</h2>
            <div className="time-options">
              {[
                { k: "allday", t: "終日" },
                { k: "morning", t: "昼" },
                { k: "afternoon", t: "午後" },
                { k: "night", t: "夜" },
                { k: "custom", t: "時刻指定" },
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

      {/* 登録済みリスト */}
      <section className="registered-list">
        <h2>登録済み予定</h2>
        {schedules.length === 0 ? (
          <div className="schedule-card">まだ予定はありません</div>
        ) : (
          schedules.map((s) => (
            <div className="schedule-card" key={s.id}>
              <div className="schedule-header">
                {s.date}　/　{timeLabel(s)}
              </div>
              <div>
                <strong>{s.title}</strong>
              </div>
              {s.memo && <div style={{ opacity: 0.9, marginTop: 4 }}>{s.memo}</div>}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
