// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import axios from "axios";
import "../index.css";

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
const timeOptions = ["終日", "昼", "夜", "時刻指定"];
const hourOptions = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const RegisterPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeStart, setRangeStart] = useState(null);

  const [shareUrl, setShareUrl] = useState("");

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 日付クリック処理
  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const dateString = clickedDate.toISOString().split("T")[0];

    if (!rangeStart) {
      // 1回目クリック → 範囲開始
      setRangeStart(dateString);
    } else {
      // 2回目クリック → 範囲終了
      const start = new Date(rangeStart);
      const end = new Date(dateString);

      if (start > end) {
        [start, end] = [end, start];
      }

      const range = [];
      let d = new Date(start);
      while (d <= end) {
        range.push(d.toISOString().split("T")[0]);
        d.setDate(d.getDate() + 1);
      }

      const newDates = [...new Set([...selectedDates, ...range])];
      setSelectedDates(newDates);
      setRangeStart(null);
    }
  };

  // 時間帯の変更
  const handleTimeChange = (date, value) => {
    const updated = selectedDates.map((d) =>
      d.date === date ? { ...d, time: value, start: "", end: "" } : d
    );
    setSelectedDates(updated);
  };

  // 時刻指定の開始・終了変更
  const handleHourChange = (date, field, value) => {
    const updated = selectedDates.map((d) =>
      d.date === date ? { ...d, [field]: value } : d
    );
    setSelectedDates(updated);
  };

  // 共有リンク発行
  const handleGenerateLink = async () => {
    try {
      const res = await axios.post("/api/register", {
        title,
        schedules: selectedDates,
      });
      setShareUrl(`${window.location.origin}/share/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert("リンク発行に失敗しました");
    }
  };

  // カレンダー描画
  const renderCalendar = () => {
    const weeks = [];
    let days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(currentYear, currentMonth, day)
        .toISOString()
        .split("T")[0];
      const isSelected = selectedDates.includes(dateString);
      const isRangeStart = rangeStart === dateString;

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`calendar-cell ${isSelected ? "selected" : ""} ${
            isRangeStart ? "range-start" : ""
          }`}
        >
          {day}
        </div>
      );

      if ((day + firstDay) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <div key={`week-${day}`} className="calendar-row">
            {days}
          </div>
        );
        days = [];
      }
    }
    return weeks;
  };

  return (
    <main className="flex-grow container mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-center mb-6 text-[#004CA0]">
        日程登録ページ
      </h2>

      {/* タイトル入力 */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
        <label className="block text-lg font-semibold mb-2">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="イベントのタイトルを入力してください"
        />
      </div>

      {/* メインレイアウト */}
      <div className="flex gap-6">
        {/* 左：カレンダー */}
        <div className="w-2/3 bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() =>
                currentMonth === 0
                  ? (setCurrentMonth(11), setCurrentYear(currentYear - 1))
                  : setCurrentMonth(currentMonth - 1)
              }
              className="nav-btn"
            >
              ＜
            </button>
            <span className="text-xl font-semibold">
              {currentYear}年 {currentMonth + 1}月
            </span>
            <button
              onClick={() =>
                currentMonth === 11
                  ? (setCurrentMonth(0), setCurrentYear(currentYear + 1))
                  : setCurrentMonth(currentMonth + 1)
              }
              className="nav-btn"
            >
              ＞
            </button>
          </div>

          <div className="calendar calendar-header">
            {daysOfWeek.map((day) => (
              <div key={day} className="calendar-header-cell">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar">{renderCalendar()}</div>
        </div>

        {/* 右：選択済み日程リスト */}
        <div className="w-1/3 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">選択した日程</h3>
          {selectedDates.length > 0 ? (
            <ul className="space-y-4">
              {selectedDates.map((date) => (
                <li key={date} className="p-3 border rounded-lg shadow-sm">
                  <p className="font-semibold mb-2">{date}</p>
                  <select
                    onChange={(e) => handleTimeChange(date, e.target.value)}
                    className="border rounded-lg px-2 py-1 mb-2"
                  >
                    {timeOptions.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  {/* 時刻指定時のみ表示 */}
                  {timeOptions === "時刻指定" && (
                    <div className="flex gap-2">
                      <select
                        onChange={(e) =>
                          handleHourChange(date, "start", e.target.value)
                        }
                        className="border rounded-lg px-2 py-1"
                      >
                        {hourOptions.map((h) => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                      <span>〜</span>
                      <select
                        onChange={(e) =>
                          handleHourChange(date, "end", e.target.value)
                        }
                        className="border rounded-lg px-2 py-1"
                      >
                        {hourOptions.map((h) => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">まだ日程が選択されていません</p>
          )}
        </div>
      </div>

      {/* 共有リンク発行 */}
      <div className="text-center mt-8">
        <button
          onClick={handleGenerateLink}
          className="btn btn-pink px-6 py-2"
        >
          共有リンクを発行
        </button>
        {shareUrl && (
          <p className="mt-4">
            発行されたリンク:{" "}
            <a href={shareUrl} className="text-blue-600 underline">
              {shareUrl}
            </a>
          </p>
        )}
      </div>
    </main>
  );
};

export default RegisterPage;
