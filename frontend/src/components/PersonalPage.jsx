// frontend/src/components/RegisterPage.jsx
import React, { useState } from "react";
import Calendar from "react-calendar";
import SelectMode from "./SelectMode";
import Holidays from "date-holidays";
import "../index.css";

const hd = new Holidays("JP");

const RegisterPage = () => {
  const [mode, setMode] = useState("range");
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [title, setTitle] = useState("");
  const [timeType, setTimeType] = useState("終日");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");

  const [shareUrls, setShareUrls] = useState([]);

  const timeOptions = [...Array(24).keys()].map((h) =>
    `${h.toString().padStart(2, "0")}:00`
  );

  // 日本時間の今日
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

  // ===== 共有リンク生成 =====
  const handleShare = async () => {
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
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dates: dates.map((d) => d.toISOString()),
          options: { type: timeType, start, end },
        }),
      });

      const data = await res.json();
      if (data.ok && data.url) {
        setShareUrls((prev) => [...prev, { title, url: data.url }]);
      } else {
        alert("リンク生成に失敗しました");
      }
    } catch (err) {
      console.error("❌ エラー:", err);
    }
  };

  // ===== 選択済み日程リスト =====
  const selectedList =
    mode === "range" ? range.filter((d) => d !== null) : multiDates;

  return (
    <div className="page-container">
      <h2 className="page-title">日程登録</h2>

      {/* ===== タイトル入力 ===== */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">タイトル</label>
        <input
          className="p-2 border rounded w-full text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：歓迎会、旅行、ミーティング"
        />
      </div>

      {/* ===== カレンダー 7割 + 日程リスト 3割 ===== */}
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
          onChange={(e) => setTimeType(e.target.value)}
        >
          <option value="終日">終日</option>
          <option value="午前">午前</option>
          <option value="午後">午後</option>
          <option value="夜">夜</option>
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

      {/* ===== 共有リンクボタン ===== */}
      <div className="mt-6 text-center">
        <button className="fancy-btn px-6 py-2" onClick={handleShare}>
          共有リンクを発行
        </button>
      </div>

      {/* ===== 発行済みリンク一覧 ===== */}
      {shareUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold">発行済みリンク</h3>
          <ul className="list-disc list-inside">
            {shareUrls.map((item, idx) => (
              <li key={idx}>
                {item.title}：{" "}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#004CA0] underline"
                >
                  {item.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
