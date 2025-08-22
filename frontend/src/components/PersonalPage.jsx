import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";
import { fetchHolidays, getTodayIso } from "../holiday";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range");
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});
  const [holidays, setHolidays] = useState([]);

  const timeOptions = [...Array(24).keys()].map((h) => `${h}:00`);
  const endTimeOptions = [...Array(24).keys()].map((h) => `${h}:00`).concat("24:00");

  const todayIso = getTodayIso();

  useEffect(() => {
    const loadHolidays = async () => {
      const list = await fetchHolidays();
      setHolidays(list);
    };
    loadHolidays();
  }, []);

  const handleDateClick = (date) => {
    const iso = date.toISOString().split("T")[0];
    if (multiDates.includes(iso)) {
      setMultiDates(multiDates.filter((d) => d !== iso));
      const newOptions = { ...dateOptions };
      delete newOptions[iso];
      setDateOptions(newOptions);
    } else {
      setMultiDates([...multiDates, iso]);
      setDateOptions({
        ...dateOptions,
        [iso]: { type: "終日", start: "9:00", end: "18:00" },
      });
    }
  };

  const handleOptionChange = (date, field, value) => {
    let newValue = value;
    if (field === "start" && dateOptions[date]?.end) {
      if (timeOptions.indexOf(value) >= endTimeOptions.indexOf(dateOptions[date].end)) {
        newValue = dateOptions[date].end;
      }
    }
    if (field === "end" && dateOptions[date]?.start) {
      if (endTimeOptions.indexOf(value) <= timeOptions.indexOf(dateOptions[date].start)) {
        newValue = dateOptions[date].start;
      }
    }
    setDateOptions({
      ...dateOptions,
      [date]: {
        ...dateOptions[date],
        [field]: newValue,
      },
    });
  };

  const handleSave = () => {
    const payload = {
      title,
      mode,
      range: mode === "range" ? range : null,
      dates: mode === "multi"
        ? multiDates.map((d) => ({
            date: d,
            ...dateOptions[d],
          }))
        : [],
    };
    console.log("保存データ:", payload);
    alert("保存しました！（デバッグ表示）");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* ===== バナー ===== */}
      <header className="shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="nav">
          <a href="/" className="hover:text-[#FDB9C8]">トップ</a>
          <a href="/register" className="hover:text-[#FDB9C8]">日程登録</a>
          <a href="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</a>
        </nav>
      </header>

      {/* ===== タイトル入力 ===== */}
      <main className="mt-20">
        <div className="mb-6">
          <label className="block text-lg mb-2 accent-text">タイトル</label>
          <input
            type="text"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 打ち合わせ日程"
          />
        </div>

        {/* ===== 切替ボタン ===== */}
        <div className="mb-4 flex gap-4">
          <button
            className={`px-4 py-2 rounded-full ${mode === "range" ? "bg-[#FDB9C8] text-black" : "bg-gray-700"}`}
            onClick={() => { setMode("range"); setMultiDates([]); }}
          >
            範囲選択
          </button>
          <button
            className={`px-4 py-2 rounded-full ${mode === "multi" ? "bg-[#FDB9C8] text-black" : "bg-gray-700"}`}
            onClick={() => { setMode("multi"); setRange([null, null]); }}
          >
            複数選択
          </button>
        </div>

        {/* ===== レイアウト（左7割カレンダー + 右3割リスト） ===== */}
        <div className="register-layout">
          {/* カレンダー */}
          <div className="calendar-section">
            {mode === "range" ? (
              <Calendar
                selectRange
                onChange={setRange}
                value={range}
                tileClassName={({ date }) => {
                  const iso = date.toISOString().split("T")[0];
                  let classes = [];
                  if (iso === todayIso) classes.push("react-calendar__tile--today");
                  if (date.getDay() === 0 || holidays.includes(iso)) classes.push("holiday");
                  return classes.join(" ");
                }}
              />
            ) : (
              <Calendar
                onClickDay={handleDateClick}
                tileClassName={({ date }) => {
                  const iso = date.toISOString().split("T")[0];
                  let classes = [];
                  if (multiDates.includes(iso)) classes.push("react-calendar__tile--active");
                  if (iso === todayIso) classes.push("react-calendar__tile--today");
                  if (date.getDay() === 0 || holidays.includes(iso)) classes.push("holiday");
                  return classes.join(" ");
                }}
              />
            )}
          </div>

          {/* 選択した日程 */}
          <div className="schedule-section">
            <h2 className="text-xl font-bold mb-4 text-[#004CA0]">📅 選択した日程</h2>
            {mode === "range" && range[0] && range[1] && (
              <div className="bg-gray-100 p-3 rounded-lg shadow-sm text-black">
                {range[0].toLocaleDateString()} 〜 {range[1].toLocaleDateString()}
              </div>
            )}

            {mode === "multi" && multiDates.length > 0 && (
              <div className="space-y-3">
                {multiDates.map((date) => (
                  <div key={date} className="bg-gray-100 p-3 rounded-xl shadow-md flex flex-col gap-2 text-black">
                    <span className="font-bold text-[#004CA0]">{date}</span>
                    <div className="flex gap-2 items-center">
                      <select
                        className="text-black px-2 py-1 rounded border"
                        value={dateOptions[date]?.type || "終日"}
                        onChange={(e) => handleOptionChange(date, "type", e.target.value)}
                      >
                        <option value="終日">終日</option>
                        <option value="午前">午前</option>
                        <option value="午後">午後</option>
                        <option value="時間指定">時間指定</option>
                      </select>

                      {dateOptions[date]?.type === "時間指定" && (
                        <>
                          <select
                            className="text-black px-2 py-1 rounded border"
                            value={dateOptions[date]?.start || "9:00"}
                            onChange={(e) => handleOptionChange(date, "start", e.target.value)}
                          >
                            {timeOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span>〜</span>
                          <select
                            className="text-black px-2 py-1 rounded border"
                            value={dateOptions[date]?.end || "18:00"}
                            onChange={(e) => handleOptionChange(date, "end", e.target.value)}
                          >
                            {endTimeOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="mt-6">
          <button onClick={handleSave} className="submit-btn">
            保存する
          </button>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
