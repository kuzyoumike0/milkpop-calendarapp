// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import SelectMode from "./SelectMode";
import { useNavigate } from "react-router-dom";
import "../index.css";

const RegisterPage = () => {
  const [mode, setMode] = useState("range"); // "range" | "multi"
  const [range, setRange] = useState([null, null]); // 範囲選択用
  const [multiDates, setMultiDates] = useState([]); // 複数選択用
  const [timeOptions] = useState([...Array(24).keys()].map(h => `${h}:00`));
  const [endTimeOptions] = useState([...Array(24).keys()].map(h => `${h}:00`).concat("24:00"));
  const [dateOptions, setDateOptions] = useState({});
  const [shareUrl, setShareUrl] = useState("");   // ✅ 共有リンクを保存するstate
  const navigate = useNavigate();

  // ===== 複数クリック用 =====
  const handleMultiClick = (date) => {
    const dateStr = date.toDateString();
    if (multiDates.some(d => d.toDateString() === dateStr)) {
      setMultiDates(multiDates.filter(d => d.toDateString() !== dateStr));
      const updated = { ...dateOptions };
      delete updated[dateStr];
      setDateOptions(updated);
    } else {
      setMultiDates([...multiDates, date]);
      setDateOptions({
        ...dateOptions,
        [dateStr]: { type: "終日", start: "0:00", end: "23:00" }
      });
    }
  };

  // ===== タイプ変更 =====
  const handleTypeChange = (dateStr, value) => {
    setDateOptions({
      ...dateOptions,
      [dateStr]: { ...dateOptions[dateStr], type: value }
    });
  };

  // ===== 時間変更 =====
  const handleTimeChange = (dateStr, field, value) => {
    let updated = { ...dateOptions };
    updated[dateStr][field] = value;
    const startIdx = timeOptions.indexOf(updated[dateStr].start);
    const endIdx = updated[dateStr].end === "24:00" ? 24 : timeOptions.indexOf(updated[dateStr].end);
    if (startIdx >= endIdx) {
      if (field === "start") {
        updated[dateStr].end = startIdx < 23 ? timeOptions[startIdx + 1] : "24:00";
      } else {
        updated[dateStr].start = endIdx > 0 ? timeOptions[endIdx - 1] : "0:00";
      }
    }
    setDateOptions(updated);
  };

  // ===== 共有リンク発行 =====
  const handleShareLink = async () => {
    try {
      let selectedDates = [];
      if (mode === "range" && range[0] && range[1]) {
        const dates = [];
        let cur = new Date(range[0]);
        while (cur <= range[1]) {
          dates.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        selectedDates = dates;
      } else if (mode === "multi") {
        selectedDates = multiDates;
      }

      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          dates: selectedDates,
          options: dateOptions
        }),
      });
      const data = await res.json();
      if (data.ok && data.id) {
        const url = `${window.location.origin}/share/${data.id}`;
        setShareUrl(url);              // ✅ 新しいURLを保存
        navigate(`/share/${data.id}`); // ✅ ページ遷移
      }
    } catch (err) {
      console.error("❌ 保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  // ===== 表示用の日付リスト =====
  const displayDates = mode === "range"
    ? (() => {
        if (range[0] && range[1]) {
          const dates = [];
          let cur = new Date(range[0]);
          while (cur <= range[1]) {
            dates.push(new Date(cur));
            cur.setDate(cur.getDate() + 1);
          }
          return dates;
        }
        return [];
      })()
    : multiDates;

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      <div className="register-layout">
        {/* 左：カレンダー */}
        <div className="calendar-section">
          <div className="calendar-header">
            <SelectMode mode={mode} setMode={setMode} />
          </div>

          {mode === "range" ? (
            <Calendar
              selectRange={true}
              onChange={setRange}
              value={range}
              tileClassName={({ date }) =>
                range[0] && range[1] && date >= range[0] && date <= range[1]
                  ? "selected-date"
                  : null
              }
            />
          ) : (
            <Calendar
              onClickDay={handleMultiClick}
              value={multiDates}
              tileClassName={({ date }) =>
                multiDates.some(d => d.toDateString() === date.toDateString())
                  ? "selected-date"
                  : null
              }
            />
          )}
        </div>

        {/* 右：日程リスト */}
        <div className="schedule-section">
          <h3>選択した日程</h3>
          {displayDates.length === 0 && <p>日程を選択してください。</p>}
          {displayDates.map((d, i) => {
            const dateStr = d.toDateString();
            const option = dateOptions[dateStr] || { type: "終日", start: "0:00", end: "23:00" };
            return (
              <div key={i} className="schedule-item">
                <span>{d.toLocaleDateString()}</span>
                <select
                  className="vote-select"
                  value={option.type}
                  onChange={(e) => handleTypeChange(dateStr, e.target.value)}
                >
                  <option value="終日">終日</option>
                  <option value="昼">昼</option>
                  <option value="夜">夜</option>
                  <option value="時刻指定">時刻指定</option>
                </select>

                {option.type === "時刻指定" && (
                  <div className="time-selects">
                    <select
                      value={option.start}
                      onChange={(e) => handleTimeChange(dateStr, "start", e.target.value)}
                    >
                      {timeOptions.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                    </select>
                    <span>〜</span>
                    <select
                      value={option.end}
                      onChange={(e) => handleTimeChange(dateStr, "end", e.target.value)}
                    >
                      {endTimeOptions.map((t, idx) => (
                        <option key={idx} value={t}>{t === "24:00" ? "翌日0:00" : t}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}

          {displayDates.length > 0 && (
            <>
              <button className="fancy-btn" onClick={handleShareLink}>
                共有リンクを発行
              </button>

              {shareUrl && (
                <p className="share-link">
                  共有リンク:{" "}
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    {shareUrl}
                  </a>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
