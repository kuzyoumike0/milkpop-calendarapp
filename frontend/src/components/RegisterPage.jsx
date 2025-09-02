// frontend/src/components/RegisterPage.jsx
import React, { useMemo, useState } from "react";
import Holidays from "date-holidays";
import "../register.css";

/* ===================== JST対応ユーティリティ ===================== */
const pad = (n) => String(n).padStart(2, "0");

// Date -> "YYYY-MM-DD"（ローカルタイム基準で安全）
const dateToISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// 今日（JST）の "YYYY-MM-DD"
const todayISO_JST = () => {
  const s = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const [datePart] = s.split(" ");
  const [y, m, d] = datePart.split("/").map((v) => parseInt(v, 10));
  return `${y}-${pad(m)}-${pad(d)}`;
};

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  // { [iso]: { timeType: "allday"|"day"|"night"|"custom", startTime?: "HH:MM", endTime?: "HH:MM" } }
  const [selectedDates, setSelectedDates] = useState({});
  const [mode, setMode] = useState("single"); // single | multiple | range
  const [rangeStart, setRangeStart] = useState(null);
  const [shareLink, setShareLink] = useState("");

  const hd = useMemo(() => new Holidays("JP"), []);

  /* ===================== カレンダー生成 ===================== */
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks = [];
  let day = new Date(firstDay);
  while (day <= lastDay) {
    const week = [];
    for (let i = 0; i < 7 && day <= lastDay; i++) {
      week.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    weeks.push(week);
  }

  const todayIso = todayISO_JST();

  /* ===================== クリックで選択/解除 ===================== */
  const defaultInfo = { timeType: "allday", startTime: "09:00", endTime: "18:00" };

  const handleDateClick = (date) => {
    const iso = dateToISO(date);

    if (mode === "single") {
      // すでにその1日が選択されている → 解除（空に）
      if (selectedDates[iso] && Object.keys(selectedDates).length === 1) {
        setSelectedDates({});
      } else if (selectedDates[iso] && Object.keys(selectedDates).length > 1) {
        // 念のため：他の日もある場合でも、同日を再クリックで解除
        setSelectedDates((prev) => {
          const next = { ...prev };
          delete next[iso];
          return Object.keys(next).length ? next : {};
        });
      } else {
        // その日だけを選択
        setSelectedDates({ [iso]: { ...defaultInfo } });
      }
      setRangeStart(null);
      return;
    }

    if (mode === "multiple") {
      // トグル
      setSelectedDates((prev) => {
        const next = { ...prev };
        if (next[iso]) delete next[iso];
        else next[iso] = { ...defaultInfo };
        return next;
      });
      setRangeStart(null);
      return;
    }

    // mode === "range"
    if (!rangeStart) {
      // 範囲開始前：同日を再クリックで解除、未選択なら開始マークとして一旦選択
      if (selectedDates[iso]) {
        setSelectedDates((prev) => {
          const next = { ...prev };
          delete next[iso];
          return next;
        });
      } else {
        setSelectedDates((prev) => ({ ...prev, [iso]: { ...defaultInfo } }));
        setRangeStart(date);
      }
    } else {
      // 範囲終了：開始～終了まで作って、すでに全部選ばれていれば解除、そうでなければ追加
      const start = rangeStart < date ? rangeStart : date;
      const end = rangeStart < date ? date : rangeStart;

      const rangeDates = {};
      const cur = new Date(start);
      while (cur <= end) {
        const dIso = dateToISO(cur);
        rangeDates[dIso] = { ...defaultInfo };
        cur.setDate(cur.getDate() + 1);
      }

      setSelectedDates((prev) => {
        const allSelected = Object.keys(rangeDates).every((d) => !!prev[d]);
        if (allSelected) {
          // すべて選択済み → 一括解除
          const next = { ...prev };
          Object.keys(rangeDates).forEach((d) => delete next[d]);
          return next;
        }
        // 追加（部分的に解除→追加の順で振る舞う）
        return { ...prev, ...rangeDates };
      });

      setRangeStart(null);
    }
  };

  /* ===================== 時間帯/時間の変更 ===================== */
  const handleTimeTypeChange = (dateIso, type) => {
    setSelectedDates((prev) => ({
      ...prev,
      [dateIso]: {
        ...prev[dateIso],
        timeType: type,
        startTime: type === "custom" ? prev[dateIso]?.startTime || "09:00" : null,
        endTime: type === "custom" ? prev[dateIso]?.endTime || "10:00" : null,
      },
    }));
  };

  const handleTimeChange = (dateIso, field, value) => {
    setSelectedDates((prev) => ({
      ...prev,
      [dateIso]: {
        ...prev[dateIso],
        [field]: value,
      },
    }));
  };

  /* ===================== 共有リンク発行 ===================== */
  const handleShare = async () => {
    const payload = {
      title,
      dates: Object.entries(selectedDates)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, info]) => ({ date, ...info })),
    };

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setShareLink(`${window.location.origin}/share/${data.share_token}`);
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  /* ===================== 時間候補 / 並び替え ===================== */
  const hours = Array.from({ length: 24 }, (_, i) => `${pad(i)}:00`);
  const sortedDates = Object.entries(selectedDates).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  /* ===================== JSX ===================== */
  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>

      <input
        type="text"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />

      {/* モード切替 */}
      <div className="select-mode">
        <button className={mode === "single" ? "active" : ""} onClick={() => { setMode("single"); setRangeStart(null); }}>
          単日選択
        </button>
        <button className={mode === "range" ? "active" : ""} onClick={() => { setMode("range"); setRangeStart(null); }}>
          範囲選択
        </button>
        <button className={mode === "multiple" ? "active" : ""} onClick={() => { setMode("multiple"); setRangeStart(null); }}>
          複数選択
        </button>
      </div>

      <div className="calendar-list-container">
        {/* カレンダー */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} aria-label="前の月">◀</button>
            <span>{year}年 {month + 1}月</span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} aria-label="次の月">▶</button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((d, j) => {
                    const iso = dateToISO(d);
                    const isToday = iso === todayIso;
                    const isSelected = !!selectedDates[iso];
                    const holiday = hd.isHoliday(d);

                    return (
                      <td
                        key={`${iso}-${j}`}
                        className={[
                          "cell",
                          isToday ? "today" : "",
                          isSelected ? "selected" : "",
                          holiday ? "holiday" : "",
                          j === 0 ? "sunday" : "",
                          j === 6 ? "saturday" : "",
                        ].join(" ").trim()}
                        onClick={() => handleDateClick(d)}
                      >
                        <div className="daynum">{d.getDate()}</div>
                        {holiday && <div className="holiday-name">{holiday[0].name}</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 右パネル */}
        <div className="side-panel">
          <h2>選択中の日程</h2>

          {sortedDates.length === 0 ? (
            <p>まだ日程が選択されていません</p>
          ) : (
            sortedDates.map(([dateIso, info]) => (
              <div key={dateIso} className="date-card">
                <div className="date-label">{dateIso}</div>

                {/* 時間帯ボタン（終日 / 昼 / 夜 / カスタム） */}
                <div className="time-options">
                  {[
                    { k: "allday", label: "終日" },
                    { k: "day", label: "昼" },
                    { k: "night", label: "夜" },
                    { k: "custom", label: "カスタム" },
                  ].map(({ k, label }) => (
                    <button
                      key={k}
                      className={`time-btn ${info.timeType === k ? "active" : ""}`}
                      onClick={() => handleTimeTypeChange(dateIso, k)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* 時間指定 */}
                {info.timeType === "custom" && (
                  <div className="time-range">
                    <select
                      className="cute-select"
                      value={info.startTime || "09:00"}
                      onChange={(e) => handleTimeChange(dateIso, "startTime", e.target.value)}
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="time-separator">〜</span>
                    <select
                      className="cute-select"
                      value={info.endTime || "10:00"}
                      onChange={(e) => handleTimeChange(dateIso, "endTime", e.target.value)}
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))
          )}

          <button className="register-btn" onClick={handleShare}>共有リンク発行</button>

          {shareLink && (
            <div className="share-link-box">
              <a href={shareLink} target="_blank" rel="noreferrer">{shareLink}</a>
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(shareLink)}>
                コピー
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// frontend/src/components/RegisterPage.jsx
import React, { useMemo, useState } from "react";
import Holidays from "date-holidays";
import "../register.css";

/** ====== 日付ユーティリティ（JST対応） ====== */
// カレンダー内部や比較用の ISO は UTC ではなく「ローカル値」から文字列整形する
const pad = (n) => String(n).padStart(2, "0");
const dateToISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// 現在日時を JST で取り、YYYY-MM-DD を返す
const todayISO_JST = () => {
  const s = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  // "2025/9/2 22:01:23" 形式をパース
  const [datePart] = s.split(" ");
  const [y, m, d] = datePart.split("/").map((v) => parseInt(v, 10));
  return `${y}-${pad(m)}-${pad(d)}`;
};

export default function RegisterPage() {
  const [title, setTitle] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({});
  const [mode, setMode] = useState("single"); // single | multiple | range
  const [rangeStart, setRangeStart] = useState(null);
  const [shareLink, setShareLink] = useState("");

  // 祝日（JP）
  const hd = useMemo(() => new Holidays("JP"), []);

  /** ====== カレンダー生成 ====== */
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月初・月末
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 週配列（その月の全日付を 7 日ずつに）
  const weeks = [];
  let day = new Date(firstDay);
  while (day <= lastDay) {
    const week = [];
    for (let i = 0; i < 7 && day <= lastDay; i++) {
      week.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    weeks.push(week);
  }

  // JST の当日
  const todayIso = todayISO_JST();

  /** ====== 日付クリック ====== */
  const handleDateClick = (date) => {
    const iso = dateToISO(date);

    if (mode === "single") {
      setSelectedDates({
        [iso]: { timeType: "allday", startTime: "09:00", endTime: "18:00" },
      });
    } else if (mode === "multiple") {
      setSelectedDates((prev) => {
        const next = { ...prev };
        if (next[iso]) delete next[iso];
        else next[iso] = { timeType: "allday", startTime: "09:00", endTime: "18:00" };
        return next;
      });
    } else if (mode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        const rangeDates = {};
        const cur = new Date(start);
        while (cur <= end) {
          const dIso = dateToISO(cur);
          rangeDates[dIso] = { timeType: "allday", startTime: "09:00", endTime: "18:00" };
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates((prev) => ({ ...prev, ...rangeDates }));
        setRangeStart(null);
      }
    }
  };

  /** ====== 時間帯切替 ====== */
  const handleTimeTypeChange = (date, type) => {
    setSelectedDates((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        timeType: type,
        startTime: type === "custom" ? "09:00" : null,
        endTime: type === "custom" ? "10:00" : null,
      },
    }));
  };

  /** ====== 時間変更 ====== */
  const handleTimeChange = (date, field, value) => {
    setSelectedDates((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value,
      },
    }));
  };

  /** ====== 共有リンク発行 ====== */
  const handleShare = async () => {
    const payload = {
      title,
      dates: Object.entries(selectedDates).map(([date, info]) => ({
        date,
        ...info,
      })),
    };

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setShareLink(`${window.location.origin}/share/${data.share_token}`);
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  /** ====== 時間候補（1時間ごと） ====== */
  const hours = Array.from({ length: 24 }, (_, i) => `${pad(i)}:00`);

  /** ====== 日付ソート ====== */
  const sortedDates = Object.entries(selectedDates).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  return (
    <div className="register-page">
      <h1 className="page-title">日程登録</h1>

      <input
        type="text"
        placeholder="タイトルを入力してください"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="title-input"
      />

      {/* モード切替 */}
      <div className="select-mode">
        <button className={mode === "single" ? "active" : ""} onClick={() => setMode("single")}>
          単日
        </button>
        <button className={mode === "multiple" ? "active" : ""} onClick={() => setMode("multiple")}>
          複数選択
        </button>
        <button className={mode === "range" ? "active" : ""} onClick={() => setMode("range")}>
          範囲選択
        </button>
      </div>

      <div className="calendar-list-container">
        {/* ==== 左：カレンダー ==== */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} aria-label="前の月">
              ◀
            </button>
            <span>{year}年 {month + 1}月</span>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} aria-label="次の月">
              ▶
            </button>
          </div>

          <table className="calendar-table">
            <thead>
              <tr>
                <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((d, j) => {
                    const iso = dateToISO(d);                 // ★ JST 安全
                    const isToday = iso === todayIso;          // ★ 当日判定も JST
                    const isSelected = !!selectedDates[iso];
                    const holiday = hd.isHoliday(d);           // JP 祝日
                    return (
                      <td
                        key={`${iso}-${j}`}
                        className={[
                          "cell",
                          isToday ? "today" : "",
                          isSelected ? "selected" : "",
                          holiday ? "holiday" : "",
                          j === 0 ? "sunday" : "",
                          j === 6 ? "saturday" : "",
                        ].join(" ").trim()}
                        onClick={() => handleDateClick(d)}
                      >
                        <div className="daynum">{d.getDate()}</div>
                        {holiday && <div className="holiday-name">{holiday[0].name}</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ==== 右：選択済みリスト ==== */}
        <div className="side-panel">
          <h2>選択中の日程</h2>
          {sortedDates.length === 0 ? (
            <p>まだ日程が選択されていません</p>
          ) : (
            sortedDates.map(([date, info]) => (
              <div key={date} className="date-card">
                <div className="date-label">{date}</div>

                {/* 時間帯ボタン（仕様：終日／昼／夜／時間指定） */}
                <div className="time-options">
                  {[
                    { k: "allday", label: "終日" },
                    { k: "day", label: "昼" },
                    { k: "night", label: "夜" },
                    { k: "custom", label: "時間指定" },
                  ].map(({ k, label }) => (
                    <button
                      key={k}
                      className={`time-btn ${info.timeType === k ? "active" : ""}`}
                      onClick={() => handleTimeTypeChange(date, k)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* 時間指定プルダウン */}
                {info.timeType === "custom" && (
                  <div className="time-range">
                    <select
                      className="cute-select"
                      value={info.startTime}
                      onChange={(e) => handleTimeChange(date, "startTime", e.target.value)}
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="time-separator">〜</span>
                    <select
                      className="cute-select"
                      value={info.endTime}
                      onChange={(e) => handleTimeChange(date, "endTime", e.target.value)}
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))
          )}

          <button className="register-btn" onClick={handleShare}>共有リンク発行</button>

          {shareLink && (
            <div className="share-link-box">
              <a href={shareLink} target="_blank" rel="noreferrer">{shareLink}</a>
              <button className="copy-btn" onClick={() => navigator.clipboard.writeText(shareLink)}>
                コピー
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
