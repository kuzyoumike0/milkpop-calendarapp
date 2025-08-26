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
  const [shareUrls, setShareUrls] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState("");
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

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

  // ===== 日付選択処理 =====
  const handleDateChange = (val) => {
    const newDate = new Date(val).toDateString();

    if (mode === "range") {
      if (!rangeStart) {
        // 1回目クリック → 開始日
        setRangeStart(newDate);
        setRangeEnd(null);
        setSelectedDates([newDate]);
      } else if (!rangeEnd) {
        // 2回目クリック → 終了日
        setRangeEnd(newDate);
        const start = new Date(rangeStart);
        const end = new Date(newDate);
        const rangeDates = [];
        let cursor = start < end ? start : end;
        const last = start < end ? end : start;

        while (cursor <= last) {
          rangeDates.push(new Date(cursor).toDateString());
          cursor.setDate(cursor.getDate() + 1);
        }
        setSelectedDates(rangeDates);
      } else {
        // 3回目クリック → 新しい範囲
        setRangeStart(newDate);
        setRangeEnd(null);
        setSelectedDates([newDate]);
      }
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

  // ===== カレンダーのスタイル付与 =====
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const ds = date.toDateString();

      if (mode === "range") {
        if (ds === rangeStart) return "range-start";
        if (ds === rangeEnd) return "range-end";
        if (
          rangeStart &&
          rangeEnd &&
          new Date(ds) > new Date(rangeStart) &&
          new Date(ds) < new Date(rangeEnd)
        ) {
          return "range-middle";
        }
      }

      if (date.getDay() === 0 || holidays[ds]) return "holiday";
      if (date.getDay() === 6) return "saturday";
    }
    return null;
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

  // ===== ソート済み日程 =====
  const enrichedDates = selectedDates
    .map((d) => (typeof d === "string" ? { date: d, type: "終日" } : d))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // ===== 共有リンク発行 =====
  const handleShare = async () => {
    if (enrichedDates.length === 0) {
      alert("日程を選択してください");
      return;
    }

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
        body: JSON.stringify({
          title: "共有スケジュール",
          dates,
          options: {},
        }),
      });

      if (res.ok) {
        const { share_token } = await res.json();
        const url = `${window.location.origin}/share/${share_token}`;
        setShareUrls((prev) => [url, ...prev]);
      } else {
        console.error("保存失敗", res.status);
      }
    } catch (err) {
      console.error("Error saving schedule:", err);
    }
  };

  // ===== コピー処理 =====
  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
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
            tileContent={({ date, view }) =>
              view === "month" && holidays[date.toDateString()] ? (
                <div className="holiday-name">
                  {holidays[date.toDateString()]}
                </div>
              ) : null
            }
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
                  <button className="copy-btn" onClick={() => handleCopy(url)}>
                    コピー
                  </button>
                  {copiedUrl === url && (
                    <span className="copied-msg">✅ コピーしました！</span>
                  )}
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
