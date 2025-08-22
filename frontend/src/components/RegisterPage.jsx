// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import ja from "date-fns/locale/ja";
import Holidays from "date-holidays";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../index.css";

const locales = { ja };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [selectionMode, setSelectionMode] = useState("range"); // range or multiple
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);

  // プルダウン用データ
  const [dateOptions, setDateOptions] = useState({}); // { "2025-08-22": { status: "〇", time: "終日" } }

  // 日付フォーマットキー
  const dateKey = (d) => format(d, "yyyy-MM-dd");

  // 範囲選択モード（クリックベース）
  const handleDateClickRange = ({ start }) => {
    if (!rangeStart) {
      // 1回目クリック → 開始日保存
      setRangeStart(start);
      setSelectedDates([start]);
    } else {
      // 2回目クリック → 範囲を確定
      const startDate = rangeStart < start ? rangeStart : start;
      const endDate = rangeStart < start ? start : rangeStart;

      const days = [];
      let d = new Date(startDate);
      while (d <= endDate) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }

      setSelectedDates(days);
      setRangeStart(null); // リセット
    }
  };

  // 複数選択モード
  const handleDateClickMultiple = ({ start }) => {
    const key = start.toDateString();
    setSelectedDates((prev) => {
      const exists = prev.find((d) => d.toDateString() === key);
      if (exists) {
        return prev.filter((d) => d.toDateString() !== key);
      } else {
        return [...prev, start];
      }
    });
  };

  // イベントスタイル（祝日＆選択強調）
  const eventStyleGetter = (event) => {
    const isSelected = selectedDates.some(
      (d) => d.toDateString() === event.start.toDateString()
    );
    const isHoliday = hd.isHoliday(event.start);

    return {
      style: {
        backgroundColor: isSelected
          ? "#FDB9C8"
          : isHoliday
          ? "#004CA0"
          : "#222",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
      },
    };
  };

  // プルダウン変更処理
  const handleOptionChange = (date, field, value) => {
    const key = dateKey(date);
    setDateOptions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録ページ</h2>

      {/* 選択モード切替 */}
      <div className="mode-switch">
        <label>
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={() => setSelectionMode("range")}
          />
          範囲選択
        </label>
        <label>
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={() => setSelectionMode("multiple")}
          />
          複数選択
        </label>
      </div>

      <div className="register-layout">
        {/* カレンダー */}
        <div className="calendar-section">
          <Calendar
            localizer={localizer}
            selectable
            onSelectSlot={
              selectionMode === "range"
                ? handleDateClickRange
                : handleDateClickMultiple
            }
            events={selectedDates.map((d) => ({
              start: d,
              end: d,
              title: "選択中",
            }))}
            style={{ height: 600 }}
            eventPropGetter={eventStyleGetter}
          />
        </div>

        {/* 選択日程リスト */}
        <div className="schedule-section">
          <h3>選択された日程</h3>
          <ul>
            {selectedDates.map((d, i) => {
              const key = dateKey(d);
              return (
                <li key={i} className="schedule-item">
                  <span>{format(d, "yyyy/MM/dd (E)", { locale: ja })}</span>

                  {/* 出欠プルダウン */}
                  <select
                    value={dateOptions[key]?.status || ""}
                    onChange={(e) =>
                      handleOptionChange(d, "status", e.target.value)
                    }
                  >
                    <option value="">選択</option>
                    <option value="〇">〇</option>
                    <option value="✕">✕</option>
                  </select>

                  {/* 時間帯プルダウン */}
                  <select
                    value={dateOptions[key]?.time || ""}
                    onChange={(e) =>
                      handleOptionChange(d, "time", e.target.value)
                    }
                  >
                    <option value="">時間帯</option>
                    <option value="終日">終日</option>
                    <option value="昼">昼</option>
                    <option value="夜">夜</option>
                  </select>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
