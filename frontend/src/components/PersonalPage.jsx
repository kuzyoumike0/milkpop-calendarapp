import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-multi-date-picker";
import axios from "axios";
import "../custom-purple.css"; // オリジナルテーマ

export default function PersonalPage() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [rangeMode, setRangeMode] = useState("range"); // range or multiple
  const [date, setDate] = useState(new Date());
  const [dates, setDates] = useState([]);
  const [timeslot, setTimeslot] = useState("全日");
  const [schedules, setSchedules] = useState([]);

  // 登録処理
  const handleSave = async () => {
    let startDate = null;
    let endDate = null;

    if (rangeMode === "range") {
      if (Array.isArray(date)) {
        startDate = date[0]
          ? new Date(date[0]).toISOString().split("T")[0]
          : null;
        endDate = date[1]
          ? new Date(date[1]).toISOString().split("T")[0]
          : null;
      } else {
        startDate = new Date(date).toISOString().split("T")[0];
        endDate = startDate;
      }
    } else {
      if (dates.length > 0) {
        startDate = new Date(dates[0]).toISOString().split("T")[0];
        endDate = new Date(
          dates[dates.length - 1]
        ).toISOString().split("T")[0];
      }
    }

    if (!username || !startDate || !endDate) {
      alert("ユーザー名と日付を入力してください");
      return;
    }

    await axios.post("/api/personal", {
      username,
      start_date: startDate,
      end_date: endDate,
      timeslot,
      range_mode: rangeMode,
    });

    fetchSchedules();
  };

  // 登録済みデータ取得
  const fetchSchedules = async () => {
    const res = await axios.get("/api/personal");
    setSchedules(res.data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold mb-6 text-[#FDB9C8]">
        MilkPOP Calendar - 個人スケジュール
      </header>

      <div className="bg-[#004CA0] rounded-2xl p-6 shadow-lg mb-6">
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />
        <textarea
          placeholder="メモ"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        <div className="flex gap-4 mb-4">
          <label>
            <input
              type="radio"
              value="range"
              checked={rangeMode === "range"}
              onChange={() => setRangeMode("range")}
            />{" "}
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              value="multiple"
              checked={rangeMode === "multiple"}
              onChange={() => setRangeMode("multiple")}
            />{" "}
            複数選択
          </label>
        </div>

        <div className="mb-4">
          {rangeMode === "range" ? (
            <Calendar onChange={setDate} value={date} selectRange />
          ) : (
            <DatePicker
              multiple
              value={dates}
              onChange={setDates}
              format="YYYY-MM-DD"
              className="custom-purple"
            />
          )}
        </div>

        <div className="mb-4">
          <select
            value={timeslot}
            onChange={(e) => setTimeslot(e.target.value)}
            className="p-2 rounded text-black"
          >
            <option value="全日">全日</option>
            <option value="昼">昼</option>
            <option value="夜">夜</option>
            <option value="時間指定">時間指定</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="bg-[#FDB9C8] text-black px-4 py-2 rounded-xl font-bold"
        >
          保存
        </button>
      </div>

      <div>
        <h2 className="text-xl mb-2">登録済みスケジュール</h2>
        <ul>
          {schedules.map((s, i) => (
            <li key={i} className="mb-2">
              👤 {s.username} - <span className="text-[#FDB9C8]">{s.title}</span>{" "}
              {s.memo ? `(${s.memo})` : ""} [{s.start_date} ~ {s.end_date}{" "}
              {s.timeslot}]
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
