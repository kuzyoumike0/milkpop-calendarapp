// frontend/src/components/PersonalPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import SelectMode from "./SelectMode";
import "../index.css";

const hd = new Holidays("JP");

const PersonalPage = () => {
  const [mode, setMode] = useState("range"); // "range" | "multi"
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [timeType, setTimeType] = useState("終日");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");

  const [savedSchedules, setSavedSchedules] = useState([]); // DB保存したものを即時反映

  const timeOptions = [...Array(24).keys()].map((h) =>
    `${h.toString().padStart(2, "0")}:00`
  );

  // ===== 日本時間の今日 =====
  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );

  // ===== カレンダー日付の色付け =====
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      ) {
        return "today-highlight";
      }
      if (holiday) return "holiday";
      if (date.getDay() === 0) return "sunday";
      if (date.getDay() === 6) return "saturday";
    }
    return null;
  };

  // ===== 祝日名をセルに表示 =====
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) {
        return <div className="holiday-label">{holiday[0].name}</div>;
      }
    }
    return null;
  };

  // ===== 日付クリック処理 =====
  const handleDateClick = (date) => {
    if (mode === "multi") {
      const dateStr = date.toDateString();
      if (multiDates.some((d) => d.toDateString() === dateStr)) {
        setMultiDates(multiDates.filter((d) => d.toDateString() !== dateStr));
      } else {
        setMultiDates([...multiDates, date]);
      }
    }
  };

  // ===== 時間帯切り替え =====
  const handleTimeTypeChange = (value) => {
    setTimeType(value);
    if (value === "終日") {
      setStart("09:00");
      setEnd("18:00");
    } else if (value === "午前") {
      setStart("06:00");
      setEnd("12:00");
    } else if (value === "午後") {
      setStart("12:00");
      setEnd("18:00");
    }
  };

  // ===== 保存処理（DBへ送信） =====
  const handleSave = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    const dates =
      mode === "range" ? range.filter((d) => d !== null) : multiDates;

    if (dates.length === 0) {
      alert("日程を選択してください");
      return;
    }

    try {
      const res = await fetch("/api/personal-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          memo,
          dates: dates.map((d) => d.toISOString()),
          options: { type: timeType, start, end },
        }),
      });

      const data = await res.json();
      if (data.ok) {
        // ✅ 即時反映
        setSavedSchedules((prev) => [
          ...prev,
          {
            id: data.id,
            title,
            memo,
            dates,
            options: { type: timeType, start, end },
          },
        ]);

        // 入力欄リセット
        setTitle("");
        setMemo("");
        setRange([null, null]);
        setMultiDates([]);
        setTimeType("終日");
        setStart("09:00");
        setEnd("18:00");
      } else {
        alert("保存に失敗しました");
      }
    } catch (err) {
      console.error("❌ エラー:", err);
      alert("サーバーエラーが発生しました");
    }
  };

  // ===== 選択済み日程リスト =====
  const selectedList =
    mode === "range" ? range.filter((d) => d !== null) : multiDates;

  return (
    <div className="page-container">
      <h2 className="page-title">個人日程登録</h2>

      {/* ===== タイトル入力 ===== */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">タイトル</label>
        <input
          className="p-2 border rounded w-full text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：出張、病院、打ち合わせ"
        />
      </div>

      {/* ===== メモ入力 ===== */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">メモ</label>
        <textarea
          className="p-2 border rounded w-full text-black"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="詳細や備考を入力"
        />
      </div>

      {/* ===== カレンダーと選択済み日程を横並び ===== */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-7/10 w-full">
          <SelectMode mode={mode} setMode={setMode} />
          <Calendar
            selectRange={mode === "range"}
            onChange={setRange}
            value={mode === "range" ? range : null}
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            tileContent={tileContent}
            locale="ja-JP"
            calendarType="gregory"
          />
        </div>

        <div className="md:w-3/10 w-full">
          <h3 className="font-bold">選択した日程</h3>
          <ul className="list-disc list-inside">
            {selectedList.map((d, i) => {
              const holiday = hd.isHoliday(d);
              const holidayName = holiday ? `（${holiday[0].name}）` : "";
              return (
                <li key={i}>
                  {d.toLocaleDateString()} {holidayName}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ===== 時間指定プルダウン ===== */}
      <div className="mt-4 space-y-2">
        <select
          className="p-2 border rounded text-black"
          value={timeType}
          onChange={(e) => handleTimeTypeChange(e.target.value)}
        >
          <option value="終日">終日</option>
          <option value="午前">午前</option>
          <option value="午後">午後</option>
          <option value="時刻指定">時刻指定</option>
        </select>

        {timeType === "時刻指定" && (
          <div className="mt-2 flex gap-2">
            <select
              className="p-2 border rounded text-black"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            〜
            <select
              className="p-2 border rounded text-black"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            >
              {timeOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
              <option value="24:00">24:00</option>
            </select>
          </div>
        )}
      </div>

      {/* ===== 保存ボタン ===== */}
      <div className="mt-6 text-center">
        <button className="fancy-btn px-6 py-2" onClick={handleSave}>
          保存する
        </button>
      </div>

      {/* ===== 保存済み一覧 ===== */}
      {savedSchedules.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold">保存済みスケジュール</h3>
          <ul className="list-disc list-inside">
            {savedSchedules.map((item, idx) => (
              <li key={idx}>
                <strong>{item.title}</strong>（{item.options.type}）<br />
                {item.dates.map((d, i) => (
                  <span key={i}>
                    {new Date(d).toLocaleDateString()}{" "}
                  </span>
                ))}
                <br />
                <span className="text-gray-500">{item.memo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PersonalPage;
