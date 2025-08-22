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
  const [shareUrls, setShareUrls] = useState([]);

  // 各日付のオプションを保存
  const [dateOptions, setDateOptions] = useState({});

  const timeOptions = [...Array(24).keys()].map((h) =>
    `${h.toString().padStart(2, "0")}:00`
  );

  // ===== 今日の日付 =====
  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
  );

  // ===== カレンダー色付け =====
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

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = hd.isHoliday(date);
      if (holiday) return <div className="holiday-label">{holiday[0].name}</div>;
    }
    return null;
  };

  // ===== 日付クリック処理 =====
  const handleDateClick = (date) => {
    if (mode === "multi") {
      const dateStr = date.toDateString();
      if (multiDates.some((d) => d.toDateString() === dateStr)) {
        setMultiDates(multiDates.filter((d) => d.toDateString() !== dateStr));
        // 削除時はオプションも消す
        setDateOptions((prev) => {
          const updated = { ...prev };
          delete updated[dateStr];
          return updated;
        });
      } else {
        setMultiDates([...multiDates, date]);
        // デフォルト: 終日
        setDateOptions((prev) => ({
          ...prev,
          [dateStr]: { type: "終日", start: "01:00", end: "24:00" },
        }));
      }
    }
  };

  // ===== プルダウン変更 =====
  const handleOptionChange = (dateStr, field, value) => {
    setDateOptions((prev) => {
      const updated = { ...prev };
      if (!updated[dateStr]) {
        updated[dateStr] = { type: "終日", start: "01:00", end: "24:00" };
      }
      updated[dateStr][field] = value;

      // 開始時刻は終了時刻より前にする
      if (field === "start" && updated[dateStr].end <= value) {
        updated[dateStr].end = timeOptions[timeOptions.indexOf(value) + 1] || "24:00";
      }
      if (field === "end" && updated[dateStr].start >= value) {
        const idx = timeOptions.indexOf(value);
        updated[dateStr].start = timeOptions[idx - 1] || "01:00";
      }

      return updated;
    });
  };

  // ===== 共有リンク生成 =====
  const handleShare = async () => {
    if (!title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    const dates = mode === "range" ? range.filter((d) => d !== null) : multiDates;
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
          options: dateOptions,
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

      {/* ===== 横並び（左7割カレンダー / 右3割リスト） ===== */}
      <div className="register-layout">
        <div className="calendar-section">
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

        <div className="schedule-section">
          <h3 className="font-bold">選択した日程</h3>
          {selectedList.map((d, i) => {
            const dateStr = d.toDateString();
            const holiday = hd.isHoliday(d);
            const holidayName = holiday ? `（${holiday[0].name}）` : "";

            return (
              <div key={i} className="schedule-item">
                <div className="flex flex-col w-full">
                  <span>
                    {d.toLocaleDateString()} {holidayName}
                  </span>

                  {/* 時間帯プルダウン */}
                  <select
                    value={dateOptions[dateStr]?.type || "終日"}
                    onChange={(e) =>
                      handleOptionChange(dateStr, "type", e.target.value)
                    }
                    className="mt-2 p-2 border rounded text-black"
                  >
                    <option value="終日">終日</option>
                    <option value="午前">午前</option>
                    <option value="午後">午後</option>
                    <option value="時刻指定">時間指定</option>
                  </select>

                  {/* 時刻指定時のみ */}
                  {dateOptions[dateStr]?.type === "時刻指定" && (
                    <div className="mt-2 flex gap-2">
                      <select
                        value={dateOptions[dateStr]?.start || "01:00"}
                        onChange={(e) =>
                          handleOptionChange(dateStr, "start", e.target.value)
                        }
                        className="p-2 border rounded text-black"
                      >
                        {timeOptions.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      〜
                      <select
                        value={dateOptions[dateStr]?.end || "24:00"}
                        onChange={(e) =>
                          handleOptionChange(dateStr, "end", e.target.value)
                        }
                        className="p-2 border rounded text-black"
                      >
                        {timeOptions.concat("24:00").map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
