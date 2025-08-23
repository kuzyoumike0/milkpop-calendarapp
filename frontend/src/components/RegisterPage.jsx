import React, { useState, useEffect } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
const timeOptions = Array.from({ length: 24 }, (_, i) => `${i + 1}:00`);

const RegisterPage = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});
  const [title, setTitle] = useState("");
  const [issuedUrl, setIssuedUrl] = useState("");
  const [selectionMode, setSelectionMode] = useState("multiple");
  const [rangeStart, setRangeStart] = useState(null);

  // DBから保存済みスケジュールを取得
  const [savedSchedules, setSavedSchedules] = useState([]);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      const json = await res.json();
      if (json.success) {
        setSavedSchedules(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // === 月の情報 ===
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

  // === 区分変更 ===
  const handleOptionChange = (dateStr, value) => {
    setDateOptions({
      ...dateOptions,
      [dateStr]: { ...dateOptions[dateStr], type: value },
    });
  };

  // === 時刻変更 ===
  const handleTimeChange = (dateStr, field, value) => {
    const updated = { ...dateOptions[dateStr], [field]: value };

    if (
      field === "start" &&
      timeOptions.indexOf(value) >= timeOptions.indexOf(updated.end)
    ) {
      updated.end = timeOptions[timeOptions.indexOf(value) + 1] || "24:00";
    }
    if (
      field === "end" &&
      timeOptions.indexOf(value) <= timeOptions.indexOf(updated.start)
    ) {
      updated.start = timeOptions[timeOptions.indexOf(value) - 1] || "1:00";
    }

    setDateOptions({ ...dateOptions, [dateStr]: updated });
  };

  // === 日付削除 ===
  const handleDeleteDate = (dateStr) => {
    setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    const updated = { ...dateOptions };
    delete updated[dateStr];
    setDateOptions(updated);
  };

  // === DB保存 ===
  const handleSaveSchedules = async () => {
    try {
      for (const d of selectedDates) {
        const opt =
          dateOptions[d] || { type: "終日", start: "9:00", end: "18:00" };

        await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            date: d,
            selectionMode,
            timeType: opt.type,
            startTime: opt.start,
            endTime: opt.end,
          }),
        });
      }
      setSelectedDates([]);
      setDateOptions({});
      await fetchSchedules(); // 即時反映
      alert("✅ スケジュールを保存しました！");
    } catch (err) {
      console.error(err);
      alert("❌ 保存に失敗しました");
    }
  };

  // === DB削除 ===
  const handleDeleteSchedule = async (id) => {
    try {
      await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });
      await fetchSchedules(); // 即時反映
    } catch (err) {
      console.error(err);
      alert("❌ 削除に失敗しました");
    }
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
    cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
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

          {/* 選択日程 & 保存済み日程 */}
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

            <button onClick={handleSaveSchedules} className="save-btn mt-6">
              💾 スケジュールを保存
            </button>

            {issuedUrl && (
              <div className="issued-url mt-4">
                <p>✅ 発行されたURL:</p>
                <a href={issuedUrl} target="_blank" rel="noopener noreferrer">
                  {issuedUrl}
                </a>
              </div>
            )}

            <h2 className="mt-8">📋 保存済みスケジュール</h2>
            <ul>
              {savedSchedules.map((s) => (
                <li key={s.id} className="schedule-card flex justify-between items-center">
                  <div>
                    <span className="schedule-title">
                      {s.title} ({s.date})
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      {s.time_type === "時刻指定"
                        ? `${s.start_time}〜${s.end_time}`
                        : s.time_type}
                    </span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteSchedule(s.id)}
                  >
                    ✖
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RegisterPage;
