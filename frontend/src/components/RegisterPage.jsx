import React, { useState, useEffect } from "react";
import "../index.css";
import { fetchHolidays, getTodayIso } from "../holiday";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range");
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [shareLink, setShareLink] = useState(null);

  const todayIso = getTodayIso();
  const [currentDate, setCurrentDate] = useState(new Date());

  // 時刻選択肢 (1:00〜0:00)
  const timeOptions = [...Array(24).keys()].map((h) => `${(h + 1) % 24}:00`);
  const endTimeOptions = [...Array(24).keys()].map((h) => `${(h + 1) % 24}:00`);

  useEffect(() => {
    const loadHolidays = async () => {
      const list = await fetchHolidays();
      setHolidays(list);
    };
    loadHolidays();
  }, []);

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const iso = date.toISOString().split("T")[0];

    if (mode === "multi") {
      if (multiDates.includes(iso)) {
        removeDate(iso);
      } else {
        setMultiDates([...multiDates, iso]);
        setDateOptions({
          ...dateOptions,
          [iso]: { type: "終日", start: "1:00", end: "2:00" },
        });
      }
    } else if (mode === "range") {
      if (!range[0] || (range[0] && range[1])) {
        setRange([date, null]);
      } else if (range[0] && !range[1]) {
        if (date < range[0]) {
          setRange([date, range[0]]);
        } else {
          setRange([range[0], date]);
        }
      }
    }
  };

  const getRangeDates = () => {
    if (!range[0] || !range[1]) return [];
    const dates = [];
    let cur = new Date(range[0]);
    while (cur <= range[1]) {
      dates.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  const removeDate = (iso) => {
    setMultiDates(multiDates.filter((d) => d !== iso));
    const newOptions = { ...dateOptions };
    delete newOptions[iso];
    setDateOptions(newOptions);
  };

  const handleOptionChange = (date, field, value) => {
    let newValue = value;

    // バリデーション: 開始 < 終了
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

  const handleShare = () => {
    const link = `${window.location.origin}/share/${Math.random()
      .toString(36)
      .substr(2, 8)}`;
    setShareLink(link);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="nav">
          <a href="/" className="hover:text-[#FDB9C8]">トップ</a>
          <a href="/register" className="hover:text-[#FDB9C8]">日程登録</a>
          <a href="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</a>
        </nav>
      </header>

      <main>
        <div className="mb-6">
          <label className="block text-lg mb-2">タイトル</label>
          <input
            type="text"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 打ち合わせ日程"
          />
        </div>

        <div className="radio-group">
          <label className={`radio-label ${mode === "range" ? "radio-active" : ""}`}>
            <input
              type="radio"
              name="mode"
              value="range"
              checked={mode === "range"}
              onChange={() => { setMode("range"); setMultiDates([]); setRange([null, null]); }}
            />
            範囲選択
          </label>
          <label className={`radio-label ${mode === "multi" ? "radio-active" : ""}`}>
            <input
              type="radio"
              name="mode"
              value="multi"
              checked={mode === "multi"}
              onChange={() => { setMode("multi"); setRange([null, null]); }}
            />
            複数選択
          </label>
        </div>

        <div className="register-layout">
          <div className="calendar-section">
            <div className="custom-calendar">
              <div className="calendar-header">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>←</button>
                <h3>{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>→</button>
              </div>
              <div className="calendar-grid">
                {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
                  <div key={w} className="weekday">{w}</div>
                ))}
                {generateDays().map((date, idx) => {
                  if (!date) return <div key={idx} />;
                  const iso = date.toISOString().split("T")[0];
                  let className = "day";
                  if (multiDates.includes(iso)) className += " selected";
                  if (range[0] && range[1] && date >= range[0] && date <= range[1]) className += " selected";
                  if (iso === todayIso) className += " today";
                  if (date.getDay() === 0 || holidays.includes(iso)) className += " holiday";
                  if (date.getDay() === 6) className += " saturday";
                  return (
                    <div key={iso} className={className} onClick={() => handleDateClick(date)}>
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="schedule-section">
            <h2 className="text-xl font-bold mb-4 text-[#004CA0]">📅 選択した日程</h2>

            {mode === "range" && getRangeDates().length > 0 &&
              getRangeDates().map((date) => (
                <div key={date} className="schedule-card">
                  <span>{date}</span>
                  <select
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
                        value={dateOptions[date]?.start || "1:00"}
                        onChange={(e) => handleOptionChange(date, "start", e.target.value)}
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span>〜</span>
                      <select
                        value={dateOptions[date]?.end || "2:00"}
                        onChange={(e) => handleOptionChange(date, "end", e.target.value)}
                      >
                        {endTimeOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              ))}

            {mode === "multi" && multiDates.length > 0 &&
              multiDates.map((date) => (
                <div key={date} className="schedule-card">
                  <span>{date}</span>
                  <select
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
                        value={dateOptions[date]?.start || "1:00"}
                        onChange={(e) => handleOptionChange(date, "start", e.target.value)}
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span>〜</span>
                      <select
                        value={dateOptions[date]?.end || "2:00"}
                        onChange={(e) => handleOptionChange(date, "end", e.target.value)}
                      >
                        {endTimeOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </>
                  )}

                  <button onClick={() => removeDate(date)}>✖</button>
                </div>
              ))}

            <div className="mt-6">
              <button onClick={handleShare} className="share-btn">共有リンクを作成</button>
              {shareLink && (
                <p className="mt-3 text-sm text-black bg-white p-2 rounded-lg shadow">
                  <a href={shareLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {shareLink}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer>
        <p>© 2025 MilkPOP Calendar</p>
      </footer>
    </div>
  );
};

export default RegisterPage;
