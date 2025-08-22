import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "../index.css";

const RegisterPage = () => {
  const [mode, setMode] = useState("range"); // "range" | "multi"
  const [range, setRange] = useState([null, null]);
  const [selectedList, setSelectedList] = useState([]);
  const [dateOptions, setDateOptions] = useState({});
  const [shareUrls, setShareUrls] = useState([]);

  const [timeOptions] = useState(
    [...Array(24).keys()].map((h) => `${h}:00`)
  );
  const [endTimeOptions] = useState(
    [...Array(24).keys()].map((h) => `${h}:00`).concat("24:00")
  );

  // ==== 日本の祝日APIから祝日取得 ====
  const [holidays, setHolidays] = useState({});
  useEffect(() => {
    fetch("https://holidays-jp.github.io/api/v1/date.json")
      .then((res) => res.json())
      .then((data) => setHolidays(data))
      .catch(() => setHolidays({}));
  }, []);

  // ==== 日付クリック処理 ====
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split("T")[0];

    if (mode === "multi") {
      setSelectedList((prev) =>
        prev.some((d) => d.toISOString().split("T")[0] === dateStr)
          ? prev.filter((d) => d.toISOString().split("T")[0] !== dateStr)
          : [...prev, date]
      );
    } else if (mode === "range") {
      if (!range[0] || (range[0] && range[1])) {
        setRange([date, null]);
      } else {
        const start = range[0] < date ? range[0] : date;
        const end = range[0] < date ? date : range[0];
        setRange([start, end]);

        let dates = [];
        let d = new Date(start);
        while (d <= end) {
          dates.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
        setSelectedList(dates);
      }
    }
  };

  // ==== プルダウン変更 ====
  const handleOptionChange = (dateStr, key, value) => {
    setDateOptions((prev) => ({
      ...prev,
      [dateStr]: { ...prev[dateStr], [key]: value },
    }));
  };

  // ==== 保存処理 ====
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

    try {
      const res = await fetch("http://localhost:5000/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formatted),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存に失敗しました");

      const newUrl = `${window.location.origin}/share/${data.shareId}`;
      setShareUrls((prev) => [newUrl, ...prev]);
    } catch (err) {
      console.error("保存エラー:", err);
    }
  };

  // ==== 今日の日付（JST） ====
  const todayStr = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  });

  return (
    <div className="page-container">
      <h1 className="page-title">📅 日程登録</h1>

      <div className="register-layout">
        {/* ===== カレンダー ===== */}
        <div className="calendar-section">
          <Calendar
            selectRange={mode === "range"}
            onClickDay={handleDateClick}
            value={selectedList}
            tileClassName={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              if (dateStr === todayStr) return "today-highlight";
              if (holidays[dateStr]) return "holiday";
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
          {selectedList.map((d, idx) => {
            const dateStr = d.toISOString().split("T")[0];
            const option = dateOptions[dateStr] || { type: "終日" };
            return (
              <div key={idx} className="schedule-item">
                <span>{dateStr}</span>
                <select
                  value={option.type}
                  onChange={(e) =>
                    handleOptionChange(dateStr, "type", e.target.value)
                  }
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
                      onChange={(e) =>
                        handleOptionChange(dateStr, "start", e.target.value)
                      }
                    >
                      <option value="">開始</option>
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      value={option.end || ""}
                      onChange={(e) =>
                        handleOptionChange(dateStr, "end", e.target.value)
                      }
                    >
                      <option value="">終了</option>
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
          <button className="submit-btn" onClick={saveSchedule}>
            保存する
          </button>

          {shareUrls.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h4>🔗 共有リンク</h4>
              <ul>
                {shareUrls.map((url, idx) => (
                  <li key={idx}>
                    <a href={url} target="_blank" rel="noreferrer">
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
