// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
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

const hd = new Holidays("JP"); // 日本の祝日

const RegisterPage = () => {
  const [title, setTitle] = useState("");
  const [selectionMode, setSelectionMode] = useState("multiple"); // multiple | range
  const [selectedDates, setSelectedDates] = useState([]);
  const [rangeStart, setRangeStart] = useState(null);
  const [dateOptions, setDateOptions] = useState([]); // 各日付の設定

  // 日付クリック時の処理
  const handleSelectSlot = ({ start }) => {
    const clickedDate = new Date(start);
    const dateStr = format(clickedDate, "yyyy-MM-dd");

    if (selectionMode === "multiple") {
      // 複数選択モード
      if (selectedDates.some((d) => format(d, "yyyy-MM-dd") === dateStr)) {
        // もう一度クリックしたら解除
        const newDates = selectedDates.filter(
          (d) => format(d, "yyyy-MM-dd") !== dateStr
        );
        setSelectedDates(newDates);
        setDateOptions(newDates.map((_) => ({ type: "allday" })));
      } else {
        const newDates = [...selectedDates, clickedDate];
        setSelectedDates(newDates);
        setDateOptions([...dateOptions, { type: "allday" }]);
      }
    } else if (selectionMode === "range") {
      // 範囲選択モード
      if (!rangeStart) {
        setRangeStart(clickedDate);
      } else {
        const startDate =
          rangeStart < clickedDate ? rangeStart : clickedDate;
        const endDate =
          rangeStart < clickedDate ? clickedDate : rangeStart;
        const range = [];
        let day = startDate;
        while (day <= endDate) {
          range.push(new Date(day));
          day = addDays(day, 1);
        }
        setSelectedDates(range);
        setDateOptions(range.map((_) => ({ type: "allday" })));
        setRangeStart(null);
      }
    }
  };

  // 日付セルのカスタマイズ（祝日＋選択強調）
  const dayPropGetter = (date) => {
    const holiday = hd.isHoliday(date);
    const isSelected = selectedDates.some(
      (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

    let className = "";
    if (holiday) className += " holiday";
    if (isSelected) className += " selected-day";

    return { className, "data-holiday": holiday ? holiday[0].name : "" };
  };

  return (
    <div className="page-card">
      <h2 style={{ color: "#FDB9C8" }}>日程登録</h2>

      {/* タイトル入力 */}
      <div className="form-group">
        <label>タイトル</label>
        <input
          type="text"
          placeholder="タイトルを入力してください"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* 選択モード切替 */}
      <div className="form-group">
        <label>選択モード</label>
        <label style={{ marginRight: "1rem" }}>
          <input
            type="radio"
            value="multiple"
            checked={selectionMode === "multiple"}
            onChange={(e) => {
              setSelectionMode(e.target.value);
              setSelectedDates([]);
              setDateOptions([]);
              setRangeStart(null);
            }}
          />
          複数選択
        </label>
        <label>
          <input
            type="radio"
            value="range"
            checked={selectionMode === "range"}
            onChange={(e) => {
              setSelectionMode(e.target.value);
              setSelectedDates([]);
              setDateOptions([]);
              setRangeStart(null);
            }}
          />
          範囲選択
        </label>
      </div>

      {/* カレンダー */}
      <Calendar
        localizer={localizer}
        selectable
        style={{ height: 500, margin: "20px 0" }}
        onSelectSlot={handleSelectSlot}
        events={[]}
        dayPropGetter={dayPropGetter}
        views={["month"]}
      />

      {/* 選択済み日付と区分プルダウン */}
      <div className="form-group">
        <label>選択済み日程</label>
        {selectedDates.length === 0 && (
          <p style={{ color: "#aaa" }}>まだ選択されていません</p>
        )}

        {selectedDates.map((date, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ marginRight: "1rem" }}>
              {format(date, "yyyy/MM/dd")}
            </span>

            {/* 区分プルダウン */}
            <select
              value={dateOptions[idx]?.type || "allday"}
              onChange={(e) => {
                const newOptions = [...dateOptions];
                newOptions[idx] = { ...newOptions[idx], type: e.target.value };
                setDateOptions(newOptions);
              }}
            >
              <option value="allday">終日</option>
              <option value="day">昼</option>
              <option value="night">夜</option>
              <option value="time">時間指定</option>
            </select>

            {/* 時間指定のときのみ */}
            {dateOptions[idx]?.type === "time" && (
              <>
                <select
                  value={dateOptions[idx]?.start || "09:00"}
                  onChange={(e) => {
                    const newOptions = [...dateOptions];
                    newOptions[idx] = {
                      ...newOptions[idx],
                      start: e.target.value,
                    };
                    setDateOptions(newOptions);
                  }}
                  style={{ marginLeft: "0.5rem" }}
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option
                      key={h}
                      value={`${h.toString().padStart(2, "0")}:00`}
                    >
                      {h}:00
                    </option>
                  ))}
                </select>
                <span style={{ margin: "0 0.5rem" }}>～</span>
                <select
                  value={dateOptions[idx]?.end || "18:00"}
                  onChange={(e) => {
                    const newOptions = [...dateOptions];
                    if (
                      newOptions[idx]?.start &&
                      e.target.value <= newOptions[idx].start
                    ) {
                      alert("終了時刻は開始時刻より後を選んでください");
                      return;
                    }
                    newOptions[idx] = {
                      ...newOptions[idx],
                      end: e.target.value,
                    };
                    setDateOptions(newOptions);
                  }}
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option
                      key={h}
                      value={`${h.toString().padStart(2, "0")}:00`}
                    >
                      {h}:00
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          console.log("登録:", { title, selectedDates, dateOptions });
          alert("登録しました！（コンソールに出力）");
        }}
      >
        登録
      </button>
    </div>
  );
};

export default RegisterPage;
