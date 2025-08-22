import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "../index.css";
import { v4 as uuidv4 } from "uuid"; // 👈 ランダムID生成用

// 範囲選択された日付リストを返す関数
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
  const [mode, setMode] = useState("range"); // 範囲 or 複数選択
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});
  const [timeOptions] = useState([...Array(24).keys()].map((h) => `${h}:00`));
  const [endTimeOptions] = useState([...Array(24).keys()].map((h) => `${h}:00`).concat("24:00"));
  const [schedules, setSchedules] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [shareUrls, setShareUrls] = useState([]); // ✅ 発行済み共有リンク履歴

  // ===== 日本時間の今日 =====
  const todayJST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const todayStr = todayJST.toISOString().split("T")[0];

  // ===== 日本の祝日を取得 =====
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
        const data = await res.json();
        setHolidays(Object.keys(data)); // YYYY-MM-DD の配列
      } catch (err) {
        console.error("祝日取得失敗:", err);
      }
    };
    fetchHolidays();
  }, []);

  // ===== 日付クリック（複数選択モード用） =====
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

    setSchedules(formatted);

    try {
      const res = await fetch("http://localhost:5000/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formatted),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      console.log("保存成功");

      // ✅ 保存成功したら毎回新しい共有リンクを生成
      const newId = uuidv4();
      const newUrl = `${window.location.origin}/share/${newId}`;
      setShareUrls((prev) => [newUrl, ...prev]); // 最新を上に追加
    } catch (err) {
      console.error("保存エラー:", err);
    }
  };

  // ===== オプション変更処理 =====
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

      {/* ===== モード切替 ===== */}
      <div className="mode-selector">
        <label className="mode-option">
          <input
            type="radio"
            value="range"
            checked={mode === "range"}
            onChange={() => {
              setMode("range");
              setMultiDates([]); // 範囲モードに切り替えたら複数選択クリア
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
              setRange([null, null]); // 複数モードに切り替えたら範囲クリア
            }}
          />
          <span>複数選択</span>
        </label>
      </div>

      {/* ===== 横並びレイアウト (左:カレンダー 右:リスト) ===== */}
      <div className="register-layout flex gap-4">
        {/* ===== カレンダー (左 7割) ===== */}
        <div className="calendar-section flex-[7]">
          <Calendar
            selectRange={mode === "range"}
            onChange={mode === "range" ? setRange : handleDateClick}
            value={mode === "range" ? range : multiDates}
            locale="ja-JP"
            calendarType="gregory"
            tileClassName={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              if (dateStr === todayStr) return "today-highlight"; // 今日
              if (holidays.includes(dateStr)) return "holiday"; // 祝日
              if (date.getDay() === 0) return "sunday"; // 日曜
              if (date.getDay() === 6) return "saturday"; // 土曜
              return "";
            }}
          />
        </div>

        {/* ===== 日程リスト (右 3割) ===== */}
        <div className="schedule-section flex-[3]">
          <h3>📝 選択した日程</h3>
          {selectedList.length === 0 && <p>日程を選択してください</p>}
          {selectedList.map((d) => {
            const dateStr = d.toISOString().split("T")[0];
            const option = dateOptions[dateStr] || { type: "終日" };

            return (
              <div key={dateStr} className="schedule-item mb-2">
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
            <button className="fancy-btn mt-4" onClick={saveSchedule}>
              💾 保存する
            </button>
          )}

          {/* ✅ 共有リンク履歴表示 */}
          {shareUrls.length > 0 && (
            <div className="mt-4">
              <h4>🔗 発行済み共有リンク</h4>
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
