// frontend/src/components/PersonalPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "../index.css";

const hd = new Holidays("JP");

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [mode, setMode] = useState("range");
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [timeType, setTimeType] = useState("終日");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");

  const timeOptions = [...Array(24).keys()].map((h) =>
    `${h.toString().padStart(2, "0")}:00`
  );

  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      ) {
        return "today-highlight";
      }
      if (holiday) return "holiday";
      if (date.getDay() === 0) return "sunday";
      if (date.getDay() === 6) return "saturday";
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return <div className="holiday-label">{holiday[0].name}</div>;
      }
    }
    return null;
  };

  const handleDateClick = (date) => {
    if (mode === "multi") {
      const dateStr = date.toDateString();
      if (multiDates.some((d) => d.toDateString() === dateStr)) {
        setMultiDates(multiDates.filter((d) => d.toDateString() !== dateStr));
      } else {
        setMultiDates([...multiDates, date]);
      }
    }
  };

  const handleTimeTypeChange = (value) => {
    setTimeType(value);
    if (value === "終日") {
      setStart("09:00");
      setEnd("18:00");
    } else if (value === "午前") {
      setStart("06:00");
      setEnd("12:00");
    } else if (value === "午後") {
      setStart("12:00");
      setEnd("18:00");
    }
  };

  const selectedList =
    mode === "range" ? range.filter((d) => d !== null) : multiDates;

  return (
    <div className="page-container">
      <h2 className="page-title">個人日程登録</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">タイトル</label>
        <input
          className="p-2 border rounded w-full text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：打ち合わせ、飲み会、旅行"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">メモ</label>
        <textarea
          className="p-2 border rounded w-full text-black"
          rows="3"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="補足情報を入力してください"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-7/10 w-full">
          <div className="mb-2">
            <label className="mr-4">
              <input
                type="radio"
                value="range"
                checked={mode === "range"}
                onChange={() => setMode("range")}
              />
              範囲選択
            </label>
            <label>
              <input
                type="radio"
                value="multi"
                checked={mode === "multi"}
                onChange={() => setMode("multi")}
              />
              複数選択
            </label>
          </div>

          <Calendar
            selectRange={mode === "range"}
            onChange={setRange}
            value={mode === "range" ? range : null}
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            tileContent={tileContent}
            locale="ja-JP"
            calendarType="gregory"
          />
        </div>

        <div className="md:w-3/10 w-full">
          <h3 className="font-bold">選択した日程</h3>
          <ul className="list-disc list-inside">
            {selectedList.map((d, i) => {
              const holiday = hd.isHoliday(d);
              const holidayName = holiday ? `（${holiday[0].name}）` : "";
              return (
                <li key={i}>
                  {d.toLocaleDateString()} {holidayName}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <select
          className="p-2 border rounded text-black"
          value={timeType}
          onChange={(e) => handleTimeTypeChange(e.target.value)}
        >
          <option value="終日">終日</option>
          <option value="午前">午前</option>
          <option value="午後">午後</option>
          <option value="時刻指定">時刻指定</option>
        </select>

        {timeType === "時刻指定" && (
          <div className="mt-2 flex gap-2">
            <select
              className="p-2 border rounded text-black"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            〜
            <select
              className="p-2 border rounded text-black"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
              <option value="24:00">24:00</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <button className="fancy-btn px-6 py-2">保存する</button>
      </div>
    </div>
  );
};

export default PersonalPage;
