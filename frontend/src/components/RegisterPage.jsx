import React, { useState } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

// 時間リスト（1時〜24時）
const timeOptions = Array.from({ length: 24 }, (_, i) => `${i + 1}:00`);

const RegisterPage = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({}); // { dateStr: { type, start, end } }
  const [title, setTitle] = useState("");
  const [issuedUrl, setIssuedUrl] = useState("");
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [rangeStart, setRangeStart] = useState(null);

  // === 今の月の日数 ===
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // === 日付クリック ===
  const handleDateClick = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    if (selectionMode === "multiple") {
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter((d) => d !== dateStr));
        const updated = { ...dateOptions };
        delete updated[dateStr];
        setDateOptions(updated);
      } else {
        setSelectedDates([...selectedDates, dateStr]);
        setDateOptions({
          ...dateOptions,
          [dateStr]: { type: "終日", start: "9:00", end: "18:00" },
        });
      }
    } else if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(dateStr);
        setSelectedDates([dateStr]);
        setDateOptions({
          [dateStr]: { type: "終日", start: "9:00", end: "18:00" },
        });
      } else {
        let start = new Date(rangeStart);
        let end = new Date(dateStr);
        if (start > end) [start, end] = [end, start];

        const range = [];
        const options = { ...dateOptions };
        const cursor = new Date(start);
        while (cursor <= end) {
          const d = `${cursor.getFullYear()}-${String(
            cursor.getMonth() + 1
          ).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
          range.push(d);
          if (!options[d]) {
            options[d] = { type: "終日", start: "9:00", end: "18:00" };
          }
          cursor.setDate(cursor.getDate() + 1);
        }
        setSelectedDates(range);
        setDateOptions(options);
        setRangeStart(null);
      }
    }
  };

  // === 区分プルダウン変更 ===
  const handleOptionChange = (dateStr, value) => {
    setDateOptions({
      ...dateOptions,
      [dateStr]: { ...dateOptions[dateStr], type: value },
    });
  };

  // === 時刻変更 ===
  const handleTimeChange = (dateStr, field, value) => {
    const updated = { ...dateOptions[dateStr], [field]: value };

    // 開始が終了より遅ければ修正
    if (field === "start" && timeOptions.indexOf(value) >= timeOptions.indexOf(updated.end)) {
      updated.end = timeOptions[timeOptions.indexOf(value) + 1] || "24:00";
    }
    if (field === "end" && timeOptions.indexOf(value) <= timeOptions.indexOf(updated.start)) {
      updated.start = timeOptions[timeOptions.indexOf(value) - 1] || "1:00";
    }

    setDateOptions({ ...dateOptions, [dateStr]: updated });
  };

  // === 選択リストから削除 ===
  const handleDeleteDate = (dateStr) => {
    setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    const updated = { ...dateOptions };
    delete updated[dateStr];
    setDateOptions(updated);
  };

  // === URL発行 ===
  const handleIssueUrl = async () => {
    try {
      const res = await fetch("/api/share-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, scheduleIds: [] }),
      });
      const json = await res.json();
      if (json.success) {
        setIssuedUrl(`${window.location.origin}/share/${json.data.url}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // === カレンダーセル ===
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(
      <div key={`empty-${i}`} className="calendar-cell empty"></div>
    );
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;
    const isSelected = selectedDates.includes(dateStr);

    cells.push(
      <div
        key={day}
        className={`calendar-cell ${isToday ? "today" : ""} ${
          isSelected ? "selected" : ""
        }`}
        onClick={() => handleDateClick(day)}
      >
        {day}
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="register-page">
        <div className="register-layout">
          {/* カレンダー */}
          <div className="calendar-section">
            {/* タイトル */}
            <div className="mb-6 text-left">
              <label className="block text-[#004CA0] font-bold mb-2 text-lg">
                📌 タイトル
              </label>
              <input
                type="text"
                placeholder="タイトルを入力してください"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value.replace(/_/g, ""))}
              />
            </div>

            {/* 選択モード */}
            <div className="mb-6 text-left">
              <label className="block text-[#004CA0] font-bold mb-2 text-lg">
                🔽 選択モード
              </label>
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="multiple"
                    checked={selectionMode === "multiple"}
                    onChange={(e) => setSelectionMode(e.target.value)}
                  />
                  <span className="custom-radio"></span>
                  複数選択
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="range"
                    checked={selectionMode === "range"}
                    onChange={(e) => setSelectionMode(e.target.value)}
                  />
                  <span className="custom-radio"></span>
                  範囲選択
                </label>
              </div>
            </div>

            {/* カレンダー年月 */}
            <h2 className="text-xl font-bold text-center text-[#004CA0] mb-2">
              {year}年 {month + 1}月
            </h2>

            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="month-btn">
                ◀ 前の月
              </button>
              <button onClick={nextMonth} className="month-btn">
                次の月 ▶
              </button>
            </div>

            <div className="custom-calendar">
              {daysOfWeek.map((d, idx) => (
                <div key={idx} className="calendar-day-header">
                  {d}
                </div>
              ))}
              {cells}
            </div>
          </div>

          {/* 選択日程 + 区分プルダウン + 時刻指定 */}
          <div className="schedule-section">
            <h2>選択した日程</h2>
            <ul>
              {selectedDates.map((d, idx) => (
                <li key={idx} className="schedule-card flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="schedule-title">{d}</span>
                    <select
                      className="vote-select"
                      value={dateOptions[d]?.type || "終日"}
                      onChange={(e) => handleOptionChange(d, e.target.value)}
                    >
                      <option value="終日">終日</option>
                      <option value="午前">午前</option>
                      <option value="午後">午後</option>
                      <option value="時刻指定">時刻指定</option>
                    </select>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteDate(d)}
                    >
                      ✖
                    </button>
                  </div>

                  {/* 時刻指定が選ばれたら時間プルダウン表示 */}
                  {dateOptions[d]?.type === "時刻指定" && (
                    <div className="flex gap-2 items-center">
                      <select
                        className="vote-select"
                        value={dateOptions[d]?.start || "9:00"}
                        onChange={(e) =>
                          handleTimeChange(d, "start", e.target.value)
                        }
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span>〜</span>
                      <select
                        className="vote-select"
                        value={dateOptions[d]?.end || "18:00"}
                        onChange={(e) =>
                          handleTimeChange(d, "end", e.target.value)
                        }
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <button onClick={handleIssueUrl} className="save-btn mt-6">
              🔗 共有リンクを発行
            </button>

            {issuedUrl && (
              <div className="issued-url mt-4">
                <p>✅ 発行されたURL:</p>
                <a href={issuedUrl} target="_blank" rel="noopener noreferrer">
                  {issuedUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RegisterPage;
