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

  const timeOptions = [...Array(24).keys()].map((h) => `${h}:00`);
  const endTimeOptions = [...Array(24).keys()].map((h) => `${h}:00`).concat("24:00");

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
    setDateOptions({
      ...dateOptions,
      [date]: {
        ...dateOptions[date],
        [field]: value,
      },
    });
  };

  const handleShare = () => {
    const link = `${window.location.origin}/share/${Math.random().toString(36).substr(2, 8)}`;
    setShareLink(link);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* ===== ヘッダー ===== */}
      <header className="shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="nav">
          <a href="/" className="hover:text-[#FDB9C8]">トップ</a>
          <a href="/register" className="hover:text-[#FDB9C8]">日程登録</a>
          <a href="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</a>
        </nav>
      </header>

      <main>
        {/* ===== タイトル入力 ===== */}
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

        {/* ===== ラジオボタン ===== */}
        <div className="radio-group">
          <label className={`radio-label ${mode === "range" ? "radio-active" : ""}`}>
            <input
              type="radio"
              name="mode"
              value="range"
              checked={mode === "range"}
              onChange={() => { setMode("range"); setMultiDates([]); }}
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
          {/* ===== 左カレンダー ===== */}
          <div className="calendar-section">
            <div className="custom-calendar">
              <div className="calendar-header">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>←</button>
                <h3>{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>→</button>
              </div>
              <div className="calendar-grid">
                {["日","月","火","水","木","金","土"].map((w) => (
                  <div key={w} className="weekday">{w}</div>
                ))}
                {generateDays().map((date, idx) => {
                  if (!date) return <div key={idx} />;
                  const iso = date.toISOString().split("T")[0];
                  let className = "day";
                  if (multiDates.includes(iso)) className += " selected";
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

          {/* ===== 右リスト ===== */}
          <div className="schedule-section">
            <h2 className="text-xl font-bold mb-4 text-[#004CA0]">📅 選択した日程</h2>
            {mode === "range" && range[0] && range[1] && (
              <div className="schedule-card">
                <span>{range[0].toLocaleDateString()} 〜 {range[1].toLocaleDateString()}</span>
              </div>
            )}
            {mode === "multi" && multiDates.length > 0 ? (
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
                    <div className="flex gap-2 items-center ml-2">
                      <select
                        value={dateOptions[date]?.start || "9:00"}
                        onChange={(e) => handleOptionChange(date, "start", e.target.value)}
                      >
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span>〜</span>
                      <select
                        value={dateOptions[date]?.end || "18:00"}
                        onChange={(e) => handleOptionChange(date, "end", e.target.value)}
                      >
                        {endTimeOptions.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))
            ) : mode === "multi" ? (
              <p className="text-gray-400">まだ日程が選択されていません</p>
            ) : null}

            {/* ===== 共有リンクボタン ===== */}
            <div className="mt-6">
              <button onClick={handleShare} className="share-btn">共有リンクを作成</button>
              {shareLink && (
                <p className="mt-3 text-sm text-black bg-white p-2 rounded-lg shadow">
                  {shareLink}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
