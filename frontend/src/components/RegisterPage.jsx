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
  const [selectionMode, setSelectionMode] = useState("range"); // 範囲 or 複数
  const [rangeStart, setRangeStart] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({}); // { "2025-08-22": { time: "時間指定", start: 10, end: 12 } }

  const [editingKey, setEditingKey] = useState(null); // 編集中の日付
  const [editValues, setEditValues] = useState({});   // 編集内容

  const dateKey = (d) => format(d, "yyyy-MM-dd");

  // 範囲選択クリック
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

  // 複数選択クリック
  const handleDateClickMultiple = ({ start }) => {
    const key = start.toDateString();
    setSelectedDates((prev) => {
      const exists = prev.find((d) => d.toDateString() === key);
      return exists
        ? prev.filter((d) => d.toDateString() !== key)
        : [...prev, start];
    });
  };

  // プルダウン更新
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

  // 編集開始
  const startEdit = (d) => {
    const key = dateKey(d);
    setEditingKey(key);
    setEditValues(dateOptions[key] || {});
  };

  // 編集保存
  const saveEdit = (d) => {
    const key = dateKey(d);
    if (
      editValues.time === "時間指定" &&
      (!editValues.start || !editValues.end || editValues.start >= editValues.end)
    ) {
      alert(`${key} の開始・終了時刻が不正です`);
      return;
    }
    setDateOptions((prev) => ({
      ...prev,
      [key]: { ...editValues },
    }));
    setEditingKey(null);
    setEditValues({});
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingKey(null);
    setEditValues({});
  };

  // 削除
  const deleteDate = (d) => {
    const key = dateKey(d);
    setSelectedDates((prev) => prev.filter((x) => dateKey(x) !== key));
    setDateOptions((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // 送信処理
  const handleSubmit = () => {
    const results = selectedDates.map((d) => {
      const key = dateKey(d);
      return { date: key, ...dateOptions[key] };
    });

    // バリデーション
    for (const r of results) {
      if (r.time === "時間指定") {
        if (!r.start || !r.end || r.start >= r.end) {
          alert(`${r.date} の開始・終了時刻が不正です`);
          return;
        }
      }
    }

    console.log("送信データ:", results);
    alert("日程を送信しました！\n" + JSON.stringify(results, null, 2));
  };

  // イベントスタイル（祝日 or 選択日）
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

        {/* 選択リスト */}
        <div className="schedule-section">
          <h3>選択された日程</h3>
          <ul>
            {selectedDates.map((d, i) => {
              const key = dateKey(d);
              const opt = dateOptions[key] || {};
              const isEditing = editingKey === key;

              return (
                <li key={i} className="schedule-item">
                  <span>{format(d, "yyyy/MM/dd (E)", { locale: ja })}</span>

                  {isEditing ? (
                    <>
                      {/* 編集モード */}
                      <select
                        value={editValues.time || ""}
                        onChange={(e) =>
                          setEditValues({ ...editValues, time: e.target.value })
                        }
                      >
                        <option value="">時間帯</option>
                        <option value="終日">終日</option>
                        <option value="昼">昼</option>
                        <option value="夜">夜</option>
                        <option value="時間指定">時間指定</option>
                      </select>

                      {editValues.time === "時間指定" && (
                        <>
                          <select
                            value={editValues.start || ""}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                start: Number(e.target.value),
                              })
                            }
                          >
                            <option value="">開始</option>
                            {Array.from({ length: 24 }, (_, h) => (
                              <option key={h + 1} value={h + 1}>
                                {h + 1}時
                              </option>
                            ))}
                          </select>

                          <select
                            value={editValues.end || ""}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                end: Number(e.target.value),
                              })
                            }
                          >
                            <option value="">終了</option>
                            {Array.from({ length: 24 }, (_, h) => (
                              <option key={h + 1} value={h + 1}>
                                {h + 1}時
                              </option>
                            ))}
                          </select>
                        </>
                      )}

                      <button onClick={() => saveEdit(d)}>保存</button>
                      <button onClick={cancelEdit}>キャンセル</button>
                    </>
                  ) : (
                    <>
                      {/* 通常表示 */}
                      <span style={{ marginLeft: "8px" }}>
                        {opt.time || "未指定"}
                        {opt.time === "時間指定" &&
                          opt.start &&
                          opt.end &&
                          ` (${opt.start}時〜${opt.end}時)`}
                      </span>
                      <button onClick={() => startEdit(d)}>✏ 編集</button>
                      <button onClick={() => deleteDate(d)}>🗑 削除</button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          {/* 送信ボタン */}
          <button className="submit-btn" onClick={handleSubmit}>
            送信する
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
