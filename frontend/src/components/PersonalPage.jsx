import React, { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker";
import axios from "axios";
import "react-multi-date-picker/styles/colors/purple.css";

export default function PersonalPage() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [rangeMode, setRangeMode] = useState("range"); // range or multiple
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [personalSchedules, setPersonalSchedules] = useState([]);

  // 日付を YYYY-MM-DD に変換
  const formatDate = (dateObj) => {
    const d = new Date(dateObj);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 保存処理
  const handleSave = async () => {
    if (!username || !dates.length) {
      alert("名前と日程を入力してください");
      return;
    }

    let start_date, end_date;
    if (rangeMode === "range" && dates.length === 2) {
      start_date = formatDate(dates[0]);
      end_date = formatDate(dates[1]);
    } else {
      start_date = formatDate(dates[0]);
      end_date = formatDate(dates[dates.length - 1]);
    }

    try {
      await axios.post("/api/personal", {
        username,
        start_date,
        end_date,
        timeslot,
        range_mode: rangeMode,
      });

      // 即時反映用に state 更新
      setPersonalSchedules((prev) => [
        ...prev,
        {
          username,
          start_date,
          end_date,
          timeslot,
          range_mode: rangeMode,
        },
      ]);
      alert("登録しました！");
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      {/* バナー */}
      <div className="w-full bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] p-4 text-center text-2xl font-bold shadow-md">
        MilkPOP Calendar
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 mt-6 w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4 text-[#FDB9C8]">
          個人スケジュール登録
        </h2>

        {/* 名前 */}
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-600"
        />

        {/* タイトル */}
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-600"
        />

        {/* 範囲 or 複数 */}
        <div className="mb-4 flex space-x-6">
          <label>
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            <span className="ml-2">範囲選択</span>
          </label>
          <label>
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            <span className="ml-2">複数選択</span>
          </label>
        </div>

        {/* カレンダー */}
        <div className="mb-4">
          <DatePicker
            value={dates}
            onChange={setDates}
            multiple={rangeMode === "multiple"}
            range={rangeMode === "range"}
            format="YYYY-MM-DD"
            className="purple"
          />
        </div>

        {/* 時間帯 */}
        <select
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-600"
        >
          <option value="全日">全日</option>
          <option value="昼">昼</option>
          <option value="夜">夜</option>
          <option value="1時-0時">1時-0時</option>
        </select>

        <button
          onClick={handleSave}
          className="w-full py-2 px-4 rounded-xl bg-[#FDB9C8] hover:bg-[#004CA0] transition font-semibold"
        >
          保存
        </button>
      </div>

      {/* 登録済み表示 */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mt-6 w-full max-w-3xl">
        <h3 className="text-lg font-semibold mb-4 text-[#FDB9C8]">
          登録済みスケジュール
        </h3>
        {personalSchedules.length === 0 ? (
          <p className="text-gray-400">まだ登録はありません</p>
        ) : (
          <ul className="space-y-2">
            {personalSchedules.map((p, idx) => (
              <li
                key={idx}
                className="bg-gray-700 rounded p-3 flex justify-between"
              >
                <span>
                  {p.username} | {p.start_date} ~ {p.end_date} | {p.timeslot}
                </span>
                <span className="text-sm text-gray-400">
                  ({p.range_mode === "range" ? "範囲" : "複数"})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
