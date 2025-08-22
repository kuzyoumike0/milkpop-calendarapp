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
  const [selectionMode, setSelectionMode] = useState("range");
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({});

  const dateKey = (d) => format(d, "yyyy-MM-dd");

  // 範囲選択
  const handleDateClickRange = ({ start }) => {
    if (!rangeStart) {
      setRangeStart(start);
      setSelectedDates([start]);
    } else {
      const startDate = rangeStart < start ? rangeStart : start;
      const endDate = rangeStart < start ? start : rangeStart;

      const days = [];
      let d = new Date(startDate);
      while (d <= endDate) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }

      setSelectedDates(days);
      setRangeStart(null);
    }
  };

  // 複数選択
  const handleDateClickMultiple = ({ start }) => {
    const key = start.toDateString();
    setSelectedDates((prev) => {
      const exists = prev.find((d) => d.toDateString() === key);
      return exists
        ? prev.filter((d) => d.toDateString() !== key)
        : [...prev, start];
    });
  };

  // イベントスタイル
  const eventStyleGetter = (event) => {
    const isSelected = selectedDates.some(
      (d) => d.toDateString() === event.start.toDateString()
    );
    const isHoliday = hd.isHoliday(event.start);

    return {
      style: {
        backgroundColor: isSelected ? "#FDB9C8" : isHoliday ? "#004CA0" : "#222",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
      },
    };
  };

  // 時刻リスト 1〜24時
  const timeOptions = Array.from({ length: 24 }, (_, i) => i + 1);

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

      {/* モード切替 */}
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

        {/* 選択リスト */}
        <div className="schedule-section">
          <h3>選択された日程</h3>
          <ul>
            {selectedDates.map((d, i) => {
              const key = dateKey(d);
              const opts = dateOptions[key] || {};
              const startVal = parseInt(opts.start || "0", 10);

              return (
                <li key={i} className="schedule-item">
                  <span>{format(d, "yyyy/MM/dd (E)", { locale: ja })}</span>

                  {/* 時間帯プルダウン */}
                  <select
                    value={opts.timezone || ""}
                    onChange={(e) =>
                      handleOptionChange(d, "timezone", e.target.value)
                    }
                  >
                    <option value="">時間帯</option>
                    <option value="終日">終日</option>
                    <option value="昼">昼</option>
                    <option value="夜">夜</option>
                    <option value="時間指定">時間指定</option>
                  </select>

                  {/* 時間指定を選んだ場合だけ時刻プルダウン表示 */}
                  {opts.timezone === "時間指定" && (
                    <>
                      {/* 開始時刻 */}
                      <select
                        value={opts.start || ""}
                        onChange={(e) =>
                          handleOptionChange(d, "start", e.target.value)
                        }
                      >
                        <option value="">開始</option>
                        {timeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}時
                          </option>
                        ))}
                      </select>

                      {/* 終了時刻（開始より後のみ表示） */}
                      <select
                        value={opts.end || ""}
                        onChange={(e) =>
                          handleOptionChange(d, "end", e.target.value)
                        }
                        disabled={!opts.start}
                      >
                        <option value="">終了</option>
                        {timeOptions
                          .filter((t) => !startVal || t > startVal)
                          .map((t) => (
                            <option key={t} value={t}>
                              {t}時
                            </option>
                          ))}
                      </select>
                    </>
                  )}
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
