import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../index.css";

const RegisterPage = () => {
  const [title, setTitle] = useState(""); // 追加: タイトル
  const [mode, setMode] = useState("range"); // 範囲 or 複数
  const [range, setRange] = useState([null, null]);
  const [multiDates, setMultiDates] = useState([]);
  const [dateOptions, setDateOptions] = useState({}); // 各日付のプルダウン設定

  const timeOptions = [...Array(24).keys()].map((h) => `${h}:00`);
  const endTimeOptions = [...Array(24).keys()].map((h) => `${h}:00`).concat("24:00");

  // ===== 複数日付クリック処理 =====
  const handleDateClick = (date) => {
    const iso = date.toISOString().split("T")[0];
    if (multiDates.includes(iso)) {
      setMultiDates(multiDates.filter((d) => d !== iso));
      const newOptions = { ...dateOptions };
      delete newOptions[iso];
      setDateOptions(newOptions);
    } else {
      setMultiDates([...multiDates, iso]);
      setDateOptions({
        ...dateOptions,
        [iso]: { type: "終日", start: "9:00", end: "18:00" },
      });
    }
  };

  // ===== プルダウン変更処理 =====
  const handleOptionChange = (date, field, value) => {
    let newValue = value;

    // バリデーション: 時間指定の場合、開始 < 終了 にする
    if (field === "start" && dateOptions[date]?.end) {
      if (timeOptions.indexOf(value) >= endTimeOptions.indexOf(dateOptions[date].end)) {
        newValue = dateOptions[date].end;
      }
    }
    if (field === "end" && dateOptions[date]?.start) {
      if (endTimeOptions.indexOf(value) <= timeOptions.indexOf(dateOptions[date].start)) {
        newValue = dateOptions[date].start;
      }
    }

    setDateOptions({
      ...dateOptions,
      [date]: {
        ...dateOptions[date],
        [field]: newValue,
      },
    });
  };

  // ===== 保存処理（API接続予定） =====
  const handleSave = () => {
    const payload = {
      title,
      mode,
      range: mode === "range" ? range : null,
      dates: mode === "multi"
        ? multiDates.map((d) => ({
            date: d,
            ...dateOptions[d],
          }))
        : [],
    };
    console.log("保存データ:", payload);

    // TODO: fetch("/api/schedules", {method:"POST", body: JSON.stringify(payload)}) ...
    alert("保存しました！（デバッグ表示）");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      {/* ===== バナー ===== */}
      <header className="bg-[#004CA0] text-white py-4 px-6 rounded-2xl mb-6 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">MilkPOP Calendar</h1>
        <nav className="space-x-4">
          <a href="/" className="hover:text-[#FDB9C8]">トップ</a>
          <a href="/register" className="hover:text-[#FDB9C8]">日程登録</a>
          <a href="/personal" className="hover:text-[#FDB9C8]">個人スケジュール</a>
        </nav>
      </header>

      {/* ===== タイトル入力 ===== */}
      <div className="mb-6">
        <label className="block text-lg mb-2">タイトル</label>
        <input
          type="text"
          className="w-full px-3 py-2 text-black rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 打ち合わせ日程"
        />
      </div>

      {/* ===== 切替ボタン ===== */}
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded-full ${mode === "range" ? "bg-[#FDB9C8] text-black" : "bg-gray-700"}`}
          onClick={() => { setMode("range"); setMultiDates([]); }}
        >
          範囲選択
        </button>
        <button
          className={`px-4 py-2 rounded-full ${mode === "multi" ? "bg-[#FDB9C8] text-black" : "bg-gray-700"}`}
          onClick={() => { setMode("multi"); setRange([null, null]); }}
        >
          複数選択
        </button>
      </div>

      {/* ===== カレンダー ===== */}
      <div className="bg-white text-black p-4 rounded-2xl shadow-lg">
        {mode === "range" ? (
          <Calendar
            selectRange
            onChange={setRange}
            value={range}
          />
        ) : (
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={({ date }) => {
              const iso = date.toISOString().split("T")[0];
              return multiDates.includes(iso) ? "bg-[#FDB9C8]" : "";
            }}
          />
        )}
      </div>

      {/* ===== 選択した日付 + プルダウン ===== */}
      <div className="mt-6 space-y-4">
        <h2 className="text-xl font-bold">選択した日程</h2>
        {mode === "range" && range[0] && range[1] && (
          <p>{range[0].toLocaleDateString()} 〜 {range[1].toLocaleDateString()}</p>
        )}

        {mode === "multi" && multiDates.length > 0 && (
          <div className="space-y-2">
            {multiDates.map((date) => (
              <div
                key={date}
                className="flex items-center gap-4 bg-gray-800 p-3 rounded-xl"
              >
                <span className="w-32">{date}</span>
                {/* 区分プルダウン */}
                <select
                  className="text-black px-2 py-1 rounded"
                  value={dateOptions[date]?.type || "終日"}
                  onChange={(e) => handleOptionChange(date, "type", e.target.value)}
                >
                  <option value="終日">終日</option>
                  <option value="午前">午前</option>
                  <option value="午後">午後</option>
                  <option value="時間指定">時間指定</option>
                </select>

                {/* 時間指定の場合のみ表示 */}
                {dateOptions[date]?.type === "時間指定" && (
                  <>
                    <select
                      className="text-black px-2 py-1 rounded"
                      value={dateOptions[date]?.start || "9:00"}
                      onChange={(e) => handleOptionChange(date, "start", e.target.value)}
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span>〜</span>
                    <select
                      className="text-black px-2 py-1 rounded"
                      value={dateOptions[date]?.end || "18:00"}
                      onChange={(e) => handleOptionChange(date, "end", e.target.value)}
                    >
                      {endTimeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== 保存ボタン ===== */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="bg-[#FDB9C8] text-black px-6 py-2 rounded-xl font-bold hover:bg-[#004CA0] hover:text-white shadow-lg"
        >
          保存する
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
