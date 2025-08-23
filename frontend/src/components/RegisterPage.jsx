import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("range");
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});
  const [shareLink, setShareLink] = useState(null);

  const timeOptions = [...Array(24).keys()].map((h) => `${h}:00`);
  const endTimeOptions = [...Array(24).keys()].map((h) => `${h}:00`).concat("24:00");

  // ===== 日付をISO文字列に変換 =====
  const formatIso = (date) => date.toISOString().split("T")[0];

  // ===== 複数選択モード: クリック =====
  const handleDateClick = (date) => {
    const iso = formatIso(date);
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

  // ===== プルダウン変更 =====
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

  // ===== 共有リンク発行 =====
  const handleShare = () => {
    const fakeUrl = `${window.location.origin}/share/${Date.now()}`;
    setShareLink(fakeUrl);
  };

  // ===== 範囲選択を日付リストに展開 =====
  const getRangeDates = () => {
    if (!range[0] || !range[1]) return [];
    const start = new Date(range[0]);
    const end = new Date(range[1]);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(formatIso(new Date(d)));
    }
    return dates;
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

      <main>
        {/* ===== タイトル入力 ===== */}
        <div className="mb-6 mt-24">
          <label className="block text-lg mb-2">タイトル</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-black rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 打ち合わせ日程"
          />
        </div>

        {/* ===== モード切替 ===== */}
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

        {/* ===== カレンダー ===== */}
        <div className="register-layout">
          <div className="calendar-section">
            <div className="custom-calendar">
              <Calendar
                selectRange={mode === "range"}
                onChange={mode === "range" ? setRange : undefined}
                onClickDay={mode === "multi" ? handleDateClick : undefined}
                value={mode === "range" ? range : multiDates.map((d) => new Date(d))}
                tileClassName={({ date }) => {
                  const iso = formatIso(date);
                  if (mode === "multi" && multiDates.includes(iso)) {
                    return "react-calendar__tile--active";
                  }
                  if (mode === "range" && getRangeDates().includes(iso)) {
                    return "react-calendar__tile--active";
                  }
                  return null;
                }}
              />
            </div>
          </div>

          {/* ===== 選択した日程リスト ===== */}
          <div className="schedule-section">
            <h2 className="text-xl font-bold mb-4 text-[#004CA0]">📅 選択した日程</h2>

            {/* 範囲選択モード */}
            {mode === "range" && getRangeDates().map((date) => (
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

            {/* 複数選択モード */}
            {mode === "multi" && multiDates.map((date) => (
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

            {/* 共有リンク */}
            <div className="mt-6">
              <button onClick={handleShare} className="share-btn">共有リンクを作成</button>
              {shareLink && (
                <div className="mt-3 text-sm text-black bg-white p-3 rounded-lg shadow flex items-center gap-3">
                  <a href={shareLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {shareLink}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      alert("リンクをコピーしました！");
                    }}
                    className="copy-btn"
                  >
                    コピー
                  </button>
                </div>
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
  const [copied, setCopied] = useState(false);

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
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          {/* カレンダー */}
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

          {/* 選択日リスト */}
          <div className="schedule-section">
            <h2 className="text-xl font-bold mb-4 text-[#004CA0]">📅 選択した日程</h2>

            {/* 範囲選択 */}
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

            {/* 複数選択 */}
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

            {/* 共有リンク */}
            <div className="mt-6">
              <button onClick={handleShare} className="share-btn">共有リンクを作成</button>
              {shareLink && (
                <div className="mt-3 text-sm text-black bg-white p-3 rounded-lg shadow flex items-center gap-3">
                  <a href={shareLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {shareLink}
                  </a>
                  <button onClick={copyToClipboard} className="copy-btn">コピー</button>
                  {copied && <span className="text-green-600">✔ コピーしました！</span>}
                </div>
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
