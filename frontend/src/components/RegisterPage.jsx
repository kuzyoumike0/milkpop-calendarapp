import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [selectionMode, setSelectionMode] = useState("range"); // range or multiple
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);

  const handleDateClick = (date) => {
    if (selectionMode === "range") {
      if (!rangeStart) {
        setRangeStart(date);
        setSelectedDates([date]);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;

        const days = [];
        let d = new Date(start);
        while (d <= end) {
          days.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }

        setSelectedDates(days);
        setRangeStart(null);
      }
    } else {
      // multiple
      if (selectedDates.some((d) => d.toDateString() === date.toDateString())) {
        setSelectedDates(selectedDates.filter((d) => d.toDateString() !== date.toDateString()));
      } else {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dates: selectedDates,
      }),
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
              selectedDates.some((d) => d.toDateString() === date.toDateString())
                ? "selected"
                : ""
            }
          />
        </div>

        {/* 日程リスト（プルダウン付き） */}
        <div className="schedule-section">
          <h3>選択した日程</h3>
          {selectedDates.length === 0 && <p>日程を選択してください</p>}
          {selectedDates.map((date, idx) => (
            <div key={idx} className="schedule-item">
              <span>{date.toLocaleDateString()}</span>
              {/* 時間帯プルダウン */}
              <select defaultValue="">
                <option value="">時間を選択</option>
                <option value="morning">午前</option>
                <option value="afternoon">午後</option>
                <option value="evening">夜</option>
              </select>
              {/* 開始時間プルダウン */}
              <select defaultValue="">
                <option value="">開始時間</option>
                {[...Array(24).keys()].map((h) => (
                  <option key={h} value={h}>{`${h}:00`}</option>
                ))}
              </select>
              {/* 終了時間プルダウン */}
              <select defaultValue="">
                <option value="">終了時間</option>
                {[...Array(24).keys()].map((h) => (
                  <option key={h} value={h}>{`${h}:00`}</option>
                ))}
              </select>
            </div>
          ))}

          {/* 送信ボタン */}
          {selectedDates.length > 0 && (
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
