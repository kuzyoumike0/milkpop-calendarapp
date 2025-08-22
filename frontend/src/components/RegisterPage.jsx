import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "../index.css";

// ===== 日付範囲展開ユーティリティ =====
const getDatesInRange = (start, end) => {
  const dates = [];
  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const RegisterPage = () => {
  const [mode, setMode] = useState("range"); // "range" | "multi"
  const [range, setRange] = useState([null, null]); // 範囲選択
  const [multiDates, setMultiDates] = useState([]); // 複数選択
  const [dateOptions, setDateOptions] = useState({}); // 日程ごとの選択状態
  const [timeOptions] = useState([...Array(24).keys()].map(h => `${h}:00`));
  const [endTimeOptions] = useState([...Array(24).keys()].map(h => `${h}:00`).concat("24:00"));
  const [schedules, setSchedules] = useState([]);

  // ===== 日付クリック処理（multiモード用） =====
  const handleDateClick = (date) => {
    const dateStr = date.toDateString();
    if (multiDates.some(d => d.toDateString() === dateStr)) {
      setMultiDates(multiDates.filter(d => d.toDateString() !== dateStr));
    } else {
      setMultiDates([...multiDates, date]);
    }
  };

  // ===== 選択済みリスト（rangeは全展開） =====
  let selectedList = [];
  if (mode === "range" && range[0] && range[1]) {
    selectedList = getDatesInRange(range[0], range[1]);
  } else if (mode === "multi") {
    selectedList = multiDates;
  }

  // ===== 保存処理（即時反映＋DB保存） =====
  const saveSchedule = async () => {
    const formatted = selectedList.map((d) => {
      const dateStr = d.toISOString().split("T")[0];
      const option = dateOptions[dateStr] || { type: "終日" };
      return {
        date: dateStr,
        type: option.type,
        start: option.start || null,
        end: option.end || null,
      };
    });

    setSchedules(formatted);

    try {
      const res = await fetch("http://localhost:5000/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formatted),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      console.log("保存成功");
    } catch (err) {
      console.error("保存エラー:", err);
    }
  };

  // ===== プルダウン変更 =====
  const handleOptionChange = (dateStr, field, value) => {
    setDateOptions((prev) => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [field]: value,
      },
    }));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">📅 日程登録</h1>

      {/* ラジオボタンで範囲 or 複数選択 */}
      <div className="mode-selector">
        <label className="mode-option">
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => {
              setMode("range");
              setMultiDates([]);
            }}
          />
          <span>範囲選択</span>
        </label>
        <label className="mode-option">
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => {
              setMode("multi");
              setRange([null, null]);
            }}
          />
          <span>複数選択</span>
        </label>
      </div>

      <div className="register-layout">
        {/* ===== カレンダー ===== */}
        <div className="calendar-section">
          <Calendar
            selectRange={mode === "range"}
            onChange={mode === "range" ? setRange : handleDateClick}
            value={mode === "range" ? range : multiDates}
          />
        </div>

        {/* ===== 選択済みリスト ===== */}
        <div className="schedule-section">
          <h3>📝 選択した日程</h3>
          {selectedList.length === 0 && <p>日程を選択してください</p>}
          {selectedList.map((d) => {
            const dateStr = d.toISOString().split("T")[0];
            const option = dateOptions[dateStr] || { type: "終日" };

            return (
              <div key={dateStr} className="schedule-item">
                <strong>{dateStr}</strong>
                <select
                  value={option.type}
                  onChange={(e) => handleOptionChange(dateStr, "type", e.target.value)}
                >
                  <option value="終日">終日</option>
                  <option value="午前">午前</option>
                  <option value="午後">午後</option>
                  <option value="時間指定">時間指定</option>
                </select>

                {option.type === "時間指定" && (
                  <>
                    <select
                      value={option.start || ""}
                      onChange={(e) => handleOptionChange(dateStr, "start", e.target.value)}
                    >
                      <option value="">開始時刻</option>
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      value={option.end || ""}
                      onChange={(e) => {
                        const start = dateOptions[dateStr]?.start;
                        if (start && timeOptions.indexOf(e.target.value) <= timeOptions.indexOf(start)) {
                          alert("終了時刻は開始時刻より後にしてください");
                          return;
                        }
                        handleOptionChange(dateStr, "end", e.target.value);
                      }}
                    >
                      <option value="">終了時刻</option>
                      {endTimeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            );
          })}

          {selectedList.length > 0 && (
            <button className="fancy-btn" onClick={saveSchedule}>
              💾 保存する
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
