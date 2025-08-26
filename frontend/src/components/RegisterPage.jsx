import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import "react-calendar/dist/Calendar.css";
import "../common.css";
import "../register.css";
import CustomDropdown from "./CustomDropdown";

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [value, setValue] = useState(new Date());
  const [holidays, setHolidays] = useState({});
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single");
  const [shareUrls, setShareUrls] = useState([]); // 発行されたURLを保持

  // ===== 祝日読み込み =====
  useEffect(() => {
    const year = new Date().getFullYear();
    const holidayList = hd.getHolidays(year);
    const holidayMap = {};
    holidayList.forEach((h) => {
      holidayMap[new Date(h.date).toDateString()] = h.name;
    });
    setHolidays(holidayMap);
  }, []);

  // ===== カレンダー装飾 =====
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holidayName = holidays[date.toDateString()];
      if (holidayName) return <div className="holiday-name">{holidayName}</div>;
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (date.getDay() === 0 || holidays[date.toDateString()]) return "holiday";
      if (date.getDay() === 6) return "saturday";
    }
    return null;
  };

  // ===== 日付選択 =====
  const handleDateChange = (val) => {
    const newDate = new Date(val).toDateString();

    if (mode === "range" && Array.isArray(val)) {
      const rangeDates = [];
      let start = new Date(val[0]);
      const end = new Date(val[1]);
      while (start <= end) {
        rangeDates.push(new Date(start).toDateString());
        start.setDate(start.getDate() + 1);
      }
      setSelectedDates([...new Set([...selectedDates, ...rangeDates])]);
    } else if (mode === "multi") {
      if (!selectedDates.find((d) => (d.date || d) === newDate)) {
        setSelectedDates([...selectedDates, newDate]);
      }
    } else if (mode === "delete") {
      setSelectedDates((prev) => prev.filter((d) => (d.date || d) !== newDate));
    } else {
      setSelectedDates([newDate]);
    }
  };

  // ===== 日付フォーマット =====
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("ja-JP", { weekday: "short" });
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) + `(${weekday})`;
  };

  // ===== 時間帯変更 =====
  const handleTimeChange = (date, type, start, end) => {
    setSelectedDates((prev) =>
      prev.map((d) => {
        if ((d.date || d) === date) {
          let newStart = start !== undefined ? Number(start) : d.startHour || 0;
          let newEnd = end !== undefined ? Number(end) : d.endHour || 1;

          if (newStart >= newEnd) {
            if (start !== undefined) newEnd = Math.min(newStart + 1, 24);
            else if (end !== undefined) newStart = Math.max(newEnd - 1, 0);
          }

          return { date, type, startHour: newStart, endHour: newEnd };
        }
        return d;
      })
    );
  };

  // ===== 単日削除 =====
  const handleDelete = (date) => {
    setSelectedDates((prev) => prev.filter((d) => (d.date || d) !== date));
  };

  // ===== オブジェクト化 & ソート =====
  const enrichedDates = selectedDates
    .map((d) => (typeof d === "string" ? { date: d, type: "終日" } : d))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // ===== 共有リンク発行 =====
  const handleShare = async () => {
    const dates = enrichedDates.map((d) => ({
      date: d.date,
      type: d.type,
      startHour: d.startHour || 0,
      endHour: d.endHour || 24,
    }));

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates }),
      });

      if (res.ok) {
        const { token } = await res.json();
        const url = `${window.location.origin}/share/${token}`;
        // 新しいURLを先頭に追加して即表示
        setShareUrls((prev) => [url, ...prev]);
      } else {
        alert("スケジュール保存に失敗しました");
      }
    } catch (err) {
      console.error("Error saving schedule:", err);
    }
  };

  return (
    <div className="register-page">
      <h2>日程登録ページ</h2>
      <div className="register-container">
        {/* カレンダー */}
        <div className="calendar-container glass-card">
          <div className="mode-buttons">
            {["single", "range", "multi", "delete"].map((m) => (
              <button
                key={m}
                className={mode === m ? "active" : ""}
                onClick={() => setMode(m)}
              >
                {m === "single" && "単日"}
                {m === "range" && "範囲選択"}
                {m === "multi" && "複数選択"}
                {m === "delete" && "単日削除"}
              </button>
            ))}
          </div>
          <Calendar
            onChange={handleDateChange}
            value={value}
            locale="ja-JP"
            calendarType="gregory"
            selectRange={mode === "range"}
            tileContent={tileContent}
            tileClassName={tileClassName}
          />
        </div>

        {/* 選択済み日程 */}
        <div className="side-panel glass-card">
          <h3>選択中の日程</h3>
          <ul className="event-list">
            {enrichedDates.map((e, idx) => (
              <li key={idx}>
                <div className="event-header">
                  <strong>{formatDate(e.date)}</strong>
                </div>
                <div className="time-type-buttons">
                  {["終日", "午前", "午後", "時間指定"].map((t) => (
                    <button
                      key={t}
                      className={e.type === t ? "active" : ""}
                      onClick={() =>
                        handleTimeChange(e.date, t, e.startHour, e.endHour)
                      }
                    >
                      {t}
                    </button>
                  ))}
                  {e.type === "時間指定" && (
                    <div className="time-dropdowns">
                      <CustomDropdown
                        value={e.startHour || 0}
                        max={23}
                        onChange={(val) =>
                          handleTimeChange(
                            e.date,
                            "時間指定",
                            val,
                            e.endHour || 1
                          )
                        }
                      />
                      ～
                      <CustomDropdown
                        value={e.endHour || 1}
                        max={24}
                        onChange={(val) =>
                          handleTimeChange(
                            e.date,
                            "時間指定",
                            e.startHour || 0,
                            val
                          )
                        }
                      />
                    </div>
                  )}
                  <button
                    className="delete-day-btn"
                    onClick={() => handleDelete(e.date)}
                  >
                    単日削除
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button onClick={handleShare} className="share-btn">
            共有リンクを発行
          </button>

          {/* 発行されたリンクを即表示 */}
          {shareUrls.length > 0 && (
            <div className="share-link-list">
              {shareUrls.map((url, idx) => (
                <div key={idx} className="share-link-card">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-link-url"
                  >
                    {url}
                  </a>
                  <button
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      alert("共有リンクをコピーしました！");
                    }}
                  >
                    コピー
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
