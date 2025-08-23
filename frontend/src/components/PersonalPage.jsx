import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";
import { v4 as uuidv4 } from "uuid";
import { fetchHolidays, getTodayIso } from "../holiday";

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [shareLink, setShareLink] = useState(null);

  const todayIso = getTodayIso();

  const timeOptions = [...Array(24).keys()].map((h) => `${h}:00`);
  const endTimeOptions = [...Array(24).keys()].map((h) => `${h}:00`).concat("24:00");

  useEffect(() => {
    const loadHolidays = async () => {
      const list = await fetchHolidays();
      setHolidays(list);
    };
    loadHolidays();
  }, []);

  // ===== 日付クリック（複数選択） =====
  const handleDateClick = (date) => {
    const iso = date.toLocaleDateString("sv-SE");
    if (multiDates.includes(iso)) {
      setMultiDates(multiDates.filter((d) => d !== iso));
      const newOptions = { ...dateOptions };
      delete newOptions[iso];
      setDateOptions(newOptions);
    } else {
      setMultiDates([...multiDates, iso]);
      setDateOptions({
        ...dateOptions,
        [iso]: { type: "終日", start: "09:00", end: "18:00", memo: "" },
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

  // ===== メモ変更 =====
  const handleMemoChange = (date, value) => {
    setDateOptions({
      ...dateOptions,
      [date]: { ...dateOptions[date], memo: value },
    });
  };

  // ===== 保存 & 共有リンク発行 =====
  const handleSave = async () => {
    if (!title) {
      alert("タイトルを入力してください");
      return;
    }
    if (multiDates.length === 0) {
      alert("日程を選択してください");
      return;
    }

    const dates = multiDates.map((date) => ({
      date,
      type: dateOptions[date]?.type || "終日",
      start: dateOptions[date]?.start || "09:00",
      end: dateOptions[date]?.end || "18:00",
      memo: dateOptions[date]?.memo || "",
    }));

    const shareId = uuidv4();
    const newSchedule = { share_id: shareId, title, dates };

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });

      if (res.ok) {
        const url = `${window.location.origin}/share/${shareId}`;
        setShareLink(url);
      } else {
        alert("スケジュール保存に失敗しました");
      }
    } catch (err) {
      console.error("保存エラー:", err);
      alert("エラーが発生しました");
    }
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

      <main className="mt-20">
        {/* ===== タイトル入力 ===== */}
        <div className="mb-6">
          <label className="block text-lg mb-2">タイトル</label>
          <input
            type="text"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 自分用メモ"
          />
        </div>

        {/* ===== カレンダー ===== */}
        <div className="register-layout">
          <div className="calendar-section">
            <Calendar
              onClickDay={handleDateClick}
              tileClassName={({ date }) => {
                const iso = date.toLocaleDateString("sv-SE");
                let classes = [];
                if (multiDates.includes(iso)) classes.push("react-calendar__tile--active");
                if (iso === todayIso) classes.push("react-calendar__tile--today");
                if (date.getDay() === 0 || holidays.includes(iso)) classes.push("holiday");
                return classes.join(" ");
              }}
            />
          </div>

          {/* ===== 選択した日程リスト ===== */}
          <div className="schedule-section">
            <h2 className="text-xl font-bold mb-4 text-[#004CA0]">📅 選択した日程</h2>
            {multiDates.length > 0 && (
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
                            value={dateOptions[date]?.start || "09:00"}
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

                    {/* メモ入力 */}
                    <textarea
                      className="w-full mt-2 p-2 border rounded text-black"
                      rows="2"
                      placeholder="メモを入力"
                      value={dateOptions[date]?.memo || ""}
                      onChange={(e) => handleMemoChange(date, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== 保存ボタン ===== */}
        <div className="mt-6">
          <button onClick={handleSave} className="submit-btn">
            保存する
          </button>
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
      </main>

      <footer>
        <p>© 2025 MilkPOP Calendar</p>
      </footer>
    </div>
  );
};

export default PersonalPage;
