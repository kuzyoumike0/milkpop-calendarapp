import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [selectionMode, setSelectionMode] = useState("range"); // range or multiple
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedSchedules, setSelectedSchedules] = useState([]); 
  // [{date, type, start, end}, ...]

  const handleDateClick = (date) => {
    const dateStr = date.toDateString();
    if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedSchedules([{ date, type: "終日", start: null, end: null }]);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;

        const days = [];
        let d = new Date(start);
        while (d <= end) {
          days.push({
            date: new Date(d),
            type: "終日",
            start: null,
            end: null,
          });
          d.setDate(d.getDate() + 1);
        }

        setSelectedSchedules(days);
        setRangeStart(null);
      }
    } else {
      if (selectedSchedules.some((s) => s.date.toDateString() === dateStr)) {
        setSelectedSchedules(selectedSchedules.filter((s) => s.date.toDateString() !== dateStr));
      } else {
        setSelectedSchedules([
          ...selectedSchedules,
          { date, type: "終日", start: null, end: null },
        ]);
      }
    }
  };

  const handleTypeChange = (idx, value) => {
    const newSchedules = [...selectedSchedules];
    newSchedules[idx].type = value;

    // 終日/午前/午後なら時間をリセット
    if (value !== "時間指定") {
      newSchedules[idx].start = null;
      newSchedules[idx].end = null;
    }
    setSelectedSchedules(newSchedules);
  };

  const handleTimeChange = (idx, field, value) => {
    const newSchedules = [...selectedSchedules];
    newSchedules[idx][field] = value;
    setSelectedSchedules(newSchedules);
  };

  const handleSubmit = async () => {
    const payload = selectedSchedules.map((s) => ({
      date: s.date.toISOString().split("T")[0], // YYYY-MM-DD
      type: s.type,
      start: s.start,
      end: s.end,
    }));

    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedules: payload }),
    });
    const data = await res.json();
    if (data.id) {
      alert(`共有リンクを作成しました: ${window.location.origin}/share/${data.id}`);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録</h2>

      {/* 範囲選択 / 複数選択 ラジオボタン */}
      <div className="mode-switch">
        <label>
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={(e) => setSelectionMode(e.target.value)}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={(e) => setSelectionMode(e.target.value)}
          />
          複数選択
        </label>
      </div>

      <div className="register-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={({ date }) =>
              selectedSchedules.some((s) => s.date.toDateString() === date.toDateString())
                ? "selected"
                : ""
            }
          />
        </div>

        {/* 日程リスト（プルダウン付き） */}
        <div className="schedule-section">
          <h3>選択した日程</h3>
          {selectedSchedules.length === 0 && <p>日程を選択してください</p>}
          {selectedSchedules.map((s, idx) => (
            <div key={idx} className="schedule-item">
              <span>{s.date.toLocaleDateString()}</span>

              {/* 種類プルダウン */}
              <select value={s.type} onChange={(e) => handleTypeChange(idx, e.target.value)}>
                <option value="終日">終日</option>
                <option value="午前">午前</option>
                <option value="午後">午後</option>
                <option value="時間指定">時間指定</option>
              </select>

              {/* 時間指定のときだけ表示 */}
              {s.type === "時間指定" && (
                <>
                  <select
                    value={s.start || ""}
                    onChange={(e) => handleTimeChange(idx, "start", e.target.value)}
                  >
                    <option value="">開始時間</option>
                    {[...Array(24).keys()].map((h) => (
                      <option key={h} value={`${h}:00`}>{`${h}:00`}</option>
                    ))}
                  </select>
                  <select
                    value={s.end || ""}
                    onChange={(e) => handleTimeChange(idx, "end", e.target.value)}
                  >
                    <option value="">終了時間</option>
                    {[...Array(24).keys()].map((h) => (
                      <option key={h} value={`${h}:00`}>{`${h}:00`}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          ))}

          {/* 送信ボタン */}
          {selectedSchedules.length > 0 && (
            <button onClick={handleSubmit} className="submit-btn">
              共有リンク作成
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
