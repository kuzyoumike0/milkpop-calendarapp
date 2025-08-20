import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [selectionMode, setSelectionMode] = useState("multiple"); // multiple or range
  const [dates, setDates] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeMode, setTimeMode] = useState("all");
  const [startTime, setStartTime] = useState("01:00");
  const [endTime, setEndTime] = useState("02:00");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(`/api/schedule/${linkid}`);
    setSchedule(res.data.schedules[0]);
    setResponses(res.data.responses);
  };

  const handleDateChange = (value) => {
    if (selectionMode === "multiple") {
      setDates((prev) => {
        const already = prev.find(
          (d) => new Date(d).toDateString() === value.toDateString()
        );
        if (already) {
          return prev.filter(
            (d) => new Date(d).toDateString() !== value.toDateString()
          );
        }
        return [...prev, value];
      });
    } else {
      setDates(value);
    }
  };

  const handleAnswerChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  const handleSave = async () => {
    const formatDate = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const selectedDates =
      selectionMode === "multiple"
        ? dates.map((d) => formatDate(d))
        : [formatDate(dates[0]), formatDate(dates[1])];

    await axios.post(`/api/share/${linkid}/response`, {
      username,
      answers: selectedDates.reduce(
        (acc, d) => ({ ...acc, [d]: answers[d] || "✖" }),
        {}
      ),
      start_time: timeMode === "custom" ? startTime : timeMode,
      end_time: timeMode === "custom" ? endTime : null,
    });

    fetchData();
  };

  return (
    <div className="p-6">
      <div className="card">
        <h2 className="card-title">📅 共有スケジュール</h2>

        {schedule && (
          <div className="mb-4 text-gray-300">
            <p>
              <span className="font-bold text-pink-400">タイトル:</span>{" "}
              {schedule.title}
            </p>
          </div>
        )}

        {/* 名前入力 */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">あなたの名前</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-800 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* 選択モード */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">選択モード</label>
          <div className="flex gap-4 text-white">
            <label>
              <input
                type="radio"
                checked={selectionMode === "multiple"}
                onChange={() => setSelectionMode("multiple")}
              />{" "}
              複数選択
            </label>
            <label>
              <input
                type="radio"
                checked={selectionMode === "range"}
                onChange={() => setSelectionMode("range")}
              />{" "}
              範囲選択
            </label>
          </div>
        </div>

        {/* カレンダー */}
        <div className="mb-4">
          <Calendar
            selectRange={selectionMode === "range"}
            onClickDay={handleDateChange}
            value={dates}
            tileClassName={({ date }) =>
              dates.some &&
              dates.some(
                (d) => new Date(d).toDateString() === date.toDateString()
              )
                ? "bg-brandPink text-black rounded-lg"
                : ""
            }
          />
        </div>

        {/* 時間帯 */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-300">時間帯</label>
          <select
            className="w-full p-2 rounded bg-gray-800 text-white"
            value={timeMode}
            onChange={(e) => setTimeMode(e.target.value)}
          >
            <option value="all">終日</option>
            <option value="day">昼</option>
            <option value="night">夜</option>
            <option value="custom">時間指定</option>
          </select>
        </div>

        {/* カスタム時間 */}
        {timeMode === "custom" && (
          <div className="flex gap-2 mb-4">
            <select
              className="w-1/2 p-2 rounded bg-gray-800 text-white"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => {
                const h = (i + 1) % 24;
                const label = h === 0 ? "0:00" : `${h}:00`;
                return (
                  <option key={h} value={`${String(h).padStart(2, "0")}:00`}>
                    {label}
                  </option>
                );
              })}
            </select>

            <select
              className="w-1/2 p-2 rounded bg-gray-800 text-white"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              {Array.from({ length: 24 }, (_, i) => {
                const h = (i + 1) % 24;
                const label = h === 0 ? "0:00" : `${h}:00`;
                return (
                  <option key={h} value={`${String(h).padStart(2, "0")}:00`}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* 保存ボタン */}
        <button onClick={handleSave} className="btn w-full">
          保存する
        </button>
      </div>

      {/* 登録済み回答一覧 */}
      <div className="mt-6">
        <h3 className="text-pink-400 mb-2">参加者の回答一覧</h3>
        <div className="grid gap-4">
          {responses.map((r, i) => (
            <div key={i} className="card bg-gray-800 text-gray-200">
              <p className="text-pink-400 font-bold">{r.username}</p>
              <pre className="text-sm">{JSON.stringify(r.answers, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
