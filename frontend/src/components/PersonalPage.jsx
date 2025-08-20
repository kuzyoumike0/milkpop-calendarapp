import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function PersonalPage() {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dates, setDates] = useState([]);
  const [rangeMode, setRangeMode] = useState("multiple");
  const [timeslot, setTimeslot] = useState("全日");
  const [schedules, setSchedules] = useState([]);

  // === 日付選択 ===
  const handleDateChange = (value) => {
    if (rangeMode === "range") {
      if (Array.isArray(value)) {
        const [start, end] = value;
        if (start && end) {
          const d = [];
          let cur = new Date(start);
          while (cur <= end) {
            d.push(cur.toISOString().split("T")[0]);
            cur.setDate(cur.getDate() + 1);
          }
          setDates(d);
        }
      }
    } else {
      if (Array.isArray(value)) {
        setDates(value.map((d) => d.toISOString().split("T")[0]));
      } else {
        setDates([value.toISOString().split("T")[0]]);
      }
    }
  };

  // === 保存 ===
  const handleSave = async () => {
    try {
      await axios.post("/api/personal", {
        title,
        memo,
        dates,
        timeslot,
        range_mode: rangeMode,
      });
      setTitle("");
      setMemo("");
      setDates([]);
      setTimeslot("全日");
      setRangeMode("multiple");
      await fetchSchedules();
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  // === DBから取得 ===
  const fetchSchedules = async () => {
    try {
      const res = await axios.get("/api/personal");
      setSchedules(res.data);
    } catch (err) {
      console.error("取得エラー:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-3xl font-bold text-white mt-6 mb-6">
        個人スケジュール
      </h1>

      {/* 入力カード */}
      <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-2xl p-6 w-full max-w-3xl mb-6">
        {/* タイトル */}
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-3 rounded-lg border border-gray-300"
        />

        {/* メモ */}
        <textarea
          placeholder="メモを入力"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-3 mb-3 rounded-lg border border-gray-300"
        />

        {/* 選択モード */}
        <div className="mb-4 text-white">
          <label className="mr-4">
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
              className="mr-1"
            />
            複数選択
          </label>
          <label>
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={() => setRangeMode("range")}
              className="mr-1"
            />
            範囲選択
          </label>
        </div>

        {/* カレンダー */}
        <Calendar
          onChange={handleDateChange}
          selectRange={rangeMode === "range"}
          value={dates.length ? dates.map((d) => new Date(d)) : null}
          tileClassName={({ date }) =>
            dates.includes(date.toISOString().split("T")[0])
              ? "bg-[#FDB9C8] text-black rounded-lg"
              : ""
          }
        />

        {/* 時間帯選択 */}
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="w-full p-3 mt-4 rounded-lg border border-gray-300"
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="時間指定">時間指定（1時〜0時）</option>
        </select>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className="mt-4 px-6 py-3 rounded-xl bg-[#004CA0] text-white font-bold shadow-md hover:bg-[#003380] transition"
        >
          保存
        </button>
      </div>

      {/* 登録済み一覧 */}
      {schedules.length > 0 && (
        <div className="backdrop-blur-md bg-white/10 border border-white/30 shadow-lg rounded-2xl p-6 w-full max-w-4xl">
          <h2 className="text-xl font-semibold text-[#FDB9C8] mb-4">
            登録済みスケジュール
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#004CA0]/80 text-white">
                <th className="px-4 py-2">タイトル</th>
                <th className="px-4 py-2">メモ</th>
                <th className="px-4 py-2">日付</th>
                <th className="px-4 py-2">時間帯</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((sch, idx) => (
                <tr
                  key={idx}
                  className="border-b border-white/30 hover:bg-white/10"
                >
                  <td className="px-4 py-2 text-white">{sch.title}</td>
                  <td className="px-4 py-2 text-white">{sch.memo}</td>
                  <td className="px-4 py-2 text-white">
                    {sch.dates?.join(", ")}
                  </td>
                  <td className="px-4 py-2 text-white">{sch.timeslot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
