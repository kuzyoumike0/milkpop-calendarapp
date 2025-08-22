import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "../index.css";
import { v4 as uuidv4 } from "uuid"; // 👈 ランダムID生成用

const getDatesInRange = (start, end) => {
  const dates = [];
  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const RegisterPage = () => {
  const [title, setTitle] = useState(""); // ✅ タイトル入力
  const [mode, setMode] = useState("range");
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});
  const [timeOptions] = useState([...Array(24).keys()].map((h) => `${h}:00`));
  const [endTimeOptions] = useState([...Array(24).keys()].map((h) => `${h}:00`).concat("24:00"));
  const [holidays, setHolidays] = useState([]);
  const [shareUrls, setShareUrls] = useState([]); // ✅ 共有リンク履歴

  // ===== 日本時間の今日 =====
  const todayJST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const todayStr = todayJST.toISOString().split("T")[0];

  // ===== 祝日取得 =====
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
        const data = await res.json();
        setHolidays(Object.keys(data));
      } catch (err) {
        console.error("祝日取得失敗:", err);
      }
    };
    fetchHolidays();
  }, []);

  // ===== 日付クリック =====
  const handleDateClick = (date) => {
    const dateStr = date.toDateString();
    if (multiDates.some((d) => d.toDateString() === dateStr)) {
      setMultiDates(multiDates.filter((d) => d.toDateString() !== dateStr));
    } else {
      setMultiDates([...multiDates, date]);
    }
  };

  // ===== 選択済み日程 =====
  let selectedList = [];
  if (mode === "range" && range[0] && range[1]) {
    selectedList = getDatesInRange(range[0], range[1]);
  } else if (mode === "multi") {
    selectedList = multiDates;
  }

  // ===== 保存処理 =====
  const saveSchedule = async () => {
    if (!title) {
      alert("タイトルを入力してください");
      return;
    }
    const formatted = selectedList.map((d) => {
      const dateStr = d.toISOString().split("T")[0];
      const option = dateOptions[dateStr] || { type: "終日" };
      return {
        date: dateStr,
        type: option.type,
        start: option.start || null,
        end: option.end || null,
      };
    });

    try {
      const res = await fetch("http://localhost:5000/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, schedules: formatted }), // ✅ title も送信
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      const result = await res.json();

      // ✅ 新しい共有URLを追加
      setShareUrls((prev) => [result.url, ...prev]);
      alert("保存しました！");
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  const handleOptionChange = (dateStr, field, value) => {
    setDateOptions((prev) => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [field]: value,
      },
    }));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">📅 日程登録</h1>

      {/* ✅ タイトル入力 */}
      <div style={{ marginBottom: "15px" }}>
        <label>
          タイトル：
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトルを入力"
            style={{ marginLeft: "10px", padding: "5px", width: "250px" }}
          />
        </label>
      </div>

      {/* モード切替 */}
      <div className="mode-selector">
        <label className="mode-option">
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => {
              setMode("range");
              setMultiDates([]);
            }}
          />
          <span>範囲選択</span>
        </label>
        <label className="mode-option">
          <input
            type="radio"
            value="multi"
            checked={mode === "multi"}
            onChange={() => {
              setMode("multi");
              setRange([null, null]);
            }}
          />
          <span>複数選択</span>
        </label>
      </div>

      <div className="register-layout">
        {/* ===== カレンダー ===== */}
        <div className="calendar-section">
          <Calendar
            selectRange={mode === "range"}
            onChange={mode === "range" ? setRange : handleDateClick}
            value={mode === "range" ? range : multiDates}
            tileClassName={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              if (dateStr === todayStr) return "today-highlight";
              if (holidays.includes(dateStr)) return "holiday";
              if (date.getDay() === 0) return "sunday";
              if (date.getDay() === 6) return "saturday";
              return "";
            }}
          />
        </div>

        {/* ===== 日程リスト ===== */}
        <div className="schedule-section">
          <h3>📝 選択した日程</h3>
          {selectedList.length === 0 && <p>日程を選択してください</p>}
          {selectedList.map((d) => {
            const dateStr = d.toISOString().split("T")[0];
            const option = dateOptions[dateStr] || { type: "終日" };

            return (
              <div key={dateStr} className="schedule-item">
                <strong>{dateStr}</strong>
                <select
                  value={option.type}
                  onChange={(e) => handleOptionChange(dateStr, "type", e.target.value)}
                >
                  <option value="終日">終日</option>
                  <option value="午前">午前</option>
                  <option value="午後">午後</option>
                  <option value="時間指定">時間指定</option>
                </select>

                {option.type === "時間指定" && (
                  <>
                    <select
                      value={option.start || ""}
                      onChange={(e) => handleOptionChange(dateStr, "start", e.target.value)}
                    >
                      <option value="">開始時刻</option>
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      value={option.end || ""}
                      onChange={(e) => {
                        const start = dateOptions[dateStr]?.start;
                        if (start && timeOptions.indexOf(e.target.value) <= timeOptions.indexOf(start)) {
                          alert("終了時刻は開始時刻より後にしてください");
                          return;
                        }
                        handleOptionChange(dateStr, "end", e.target.value);
                      }}
                    >
                      <option value="">終了時刻</option>
                      {endTimeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            );
          })}

          {selectedList.length > 0 && (
            <button className="fancy-btn" onClick={saveSchedule}>
              💾 保存する
            </button>
          )}

          {/* ✅ 共有リンク表示 */}
          {shareUrls.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h4>🔗 共有リンク</h4>
              <ul>
                {shareUrls.map((url, idx) => (
                  <li key={idx}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
