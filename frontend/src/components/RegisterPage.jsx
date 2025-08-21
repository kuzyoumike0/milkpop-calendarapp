// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ja } from "date-fns/locale";
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

// 日本の祝日データ
const hd = new Holidays("JP");
const year = new Date().getFullYear();
const jpHolidays = hd.getHolidays(year).reduce((acc, h) => {
  acc[h.date] = h.name;
  return acc;
}, {});

// 時間リスト（1時～24時）
const hours = Array.from({ length: 24 }, (_, i) => i + 1);

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [mode, setMode] = useState("single"); // single or range
  const [rangeBuffer, setRangeBuffer] = useState([]);
  const [dateDetails, setDateDetails] = useState({}); // { "2025-08-11": {区分, start, end} }

  // 日付を文字列に変換
  const toDateStr = (date) => format(date, "yyyy-MM-dd");

  // 日付クリック処理
  const handleDateClick = (date) => {
    const dateStr = toDateStr(date);

    if (mode === "single") {
      // 複数選択
      setSelectedDates((prev) =>
        prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
      );
    } else if (mode === "range") {
      // 範囲選択
      if (rangeBuffer.length === 0) {
        setRangeBuffer([date]);
      } else if (rangeBuffer.length === 1) {
        const start = rangeBuffer[0];
        const end = date;
        const range = [];
        let current = start < end ? start : end;
        const last = start < end ? end : start;

        while (current <= last) {
          range.push(toDateStr(current));
          current = new Date(current.setDate(current.getDate() + 1));
        }
        setSelectedDates([...new Set([...selectedDates, ...range])]);
        setRangeBuffer([]);
      }
    }
  };

  // カレンダーセルにクラスを付与
  const dayPropGetter = (date) => {
    const dateStr = toDateStr(date);
    if (jpHolidays[dateStr]) {
      return { className: "holiday", "data-holiday": jpHolidays[dateStr] };
    }
    if (selectedDates.includes(dateStr)) {
      return { className: "selected-day" };
    }
    return {};
  };

  // 区分変更
  const handleDivisionChange = (dateStr, value) => {
    setDateDetails((prev) => ({
      ...prev,
      [dateStr]: { division: value, start: null, end: null },
    }));
  };

  // 時刻変更
  const handleTimeChange = (dateStr, type, value) => {
    setDateDetails((prev) => {
      const detail = prev[dateStr] || {};
      let newDetail = { ...detail, [type]: value };

      // 開始時刻 < 終了時刻にする
      if (type === "start" && newDetail.end && Number(value) >= Number(newDetail.end)) {
        newDetail.end = String(Number(value) + 1);
      }
      if (type === "end" && newDetail.start && Number(value) <= Number(newDetail.start)) {
        newDetail.start = String(Number(value) - 1);
      }

      return { ...prev, [dateStr]: newDetail };
    });
  };

  const handleRegister = () => {
    console.log("タイトル:", title);
    console.log("選択日程:", selectedDates);
    console.log("詳細:", dateDetails);
    alert("登録しました！（仮）");
  };

  return (
    <div className="page-card">
      <h2>日程登録ページ</h2>

      {/* タイトル入力 */}
      <div className="form-group">
        <label>タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="イベントのタイトルを入力"
        />
      </div>

      {/* 選択モード */}
      <div className="form-group">
        <label>選択モード</label>
        <label>
          <input
            type="radio"
            name="mode"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />{" "}
          複数選択
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            name="mode"
            value="range"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />{" "}
          範囲選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        localizer={localizer}
        views={["month"]}
        style={{ height: 500 }}
        selectable={false}
        onDrillDown={handleDateClick}
        onNavigate={() => {}}
        dayPropGetter={dayPropGetter}
        onView={() => {}}
        components={{
          dateCellWrapper: (props) => (
            <div onClick={() => handleDateClick(props.value)}>{props.children}</div>
          ),
        }}
      />

      {/* 選択された日程 */}
      <div className="form-group">
        <h3>選択された日程</h3>
        {selectedDates.length === 0 && <p>日程が選択されていません</p>}
        {selectedDates.map((dateStr) => (
          <div key={dateStr} className="form-group">
            <label>{dateStr}</label>
            <select
              value={dateDetails[dateStr]?.division || ""}
              onChange={(e) => handleDivisionChange(dateStr, e.target.value)}
            >
              <option value="">区分を選択</option>
              <option value="allday">終日</option>
              <option value="day">昼</option>
              <option value="night">夜</option>
              <option value="time">時間指定</option>
            </select>

            {/* 時間指定なら時間プルダウン */}
            {dateDetails[dateStr]?.division === "time" && (
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "1rem" }}>
                <select
                  value={dateDetails[dateStr]?.start || ""}
                  onChange={(e) => handleTimeChange(dateStr, "start", e.target.value)}
                >
                  <option value="">開始時刻</option>
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}時
                    </option>
                  ))}
                </select>

                <select
                  value={dateDetails[dateStr]?.end || ""}
                  onChange={(e) => handleTimeChange(dateStr, "end", e.target.value)}
                >
                  <option value="">終了時刻</option>
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}時
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 登録ボタン */}
      <button onClick={handleRegister}>登録</button>
    </div>
  );
};

export default RegisterPage;
