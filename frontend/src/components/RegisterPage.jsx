import React, { useState, useEffect } from "react";
import "../index.css";
import { fetchHolidays, getTodayIso } from "../holiday";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [multiDates, setMultiDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});
  const [holidays, setHolidays] = useState([]);

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

  // 現在の月の日付を生成
  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
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

  // プルダウン変更処理
  const handleOptionChange = (date, field, value) => {
    setDateOptions({
      ...dateOptions,
      [date]: {
        ...dateOptions[date],
        [field]: value,
      },
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* ===== バナー ===== */}
      <header className="shadow-lg bg-[#004CA0] p-4 rounded-xl mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="nav">
          <a href="/" className="hover:text-[#FDB9C8]">トップ</a>
          <a href="/register" className="hover:text-[#FDB9C8]">日程登録</a>
          <a href="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</a>
        </nav>
      </header>

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

      <div className="register-layout">
        {/* ===== 自作カレンダー（左7割） ===== */}
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

        {/* ===== 選択した日程（右3割） ===== */}
        <div className="schedule-section">
          <h2 className="text-xl font-bold mb-4 text-[#004CA0]">📅 選択した日程</h2>
          {multiDates.length > 0 ? (
            <div className="space-y-4">
              {multiDates.map((date) => (
                <div key={date} className="schedule-card">
                  <span>{date}</span>

                  {/* 区分プルダウン */}
                  <div className="mt-2 flex gap-2 items-center">
                    <select
                      value={dateOptions[date]?.type || "終日"}
                      onChange={(e) => handleOptionChange(date, "type", e.target.value)}
                    >
                      <option value="終日">終日</option>
                      <option value="午前">午前</option>
                      <option value="午後">午後</option>
                      <option value="時間指定">時間指定</option>
                    </select>
                  </div>

                  {/* 時間指定のときだけ表示 */}
                  {dateOptions[date]?.type === "時間指定" && (
                    <div className="mt-2 flex gap-2 items-center">
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
              ))}
            </div>
          ) : (
            <p className="text-gray-400">まだ日程が選択されていません</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
