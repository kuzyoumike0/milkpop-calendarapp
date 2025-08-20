import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import PageLayout from "./PageLayout";

export default function SharePage() {
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState([]); // 初期値を [] に修正
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState({});
  const [rangeMode, setRangeMode] = useState("範囲選択");
  const [selectedDates, setSelectedDates] = useState([]);

  // 📌 DBからスケジュール取得
  useEffect(() => {
    axios
      .get("/api/schedules")
      .then((res) => {
        setSchedules(res.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // 📌 DBから回答取得
  useEffect(() => {
    axios
      .get("/api/responses")
      .then((res) => {
        setResponses(res.data || []); // null の場合も [] にする
      })
      .catch((err) => console.error(err));
  }, []);

  const handleResponseChange = (scheduleId, value) => {
    setSelected((prev) => ({ ...prev, [scheduleId]: value }));
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        Object.entries(selected).map(([scheduleId, response]) =>
          axios.post("/api/responses", {
            scheduleId,
            username,
            response,
          })
        )
      );
      const res = await axios.get("/api/responses");
      setResponses(res.data || []);
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  const handleDateChange = (value) => {
    if (rangeMode === "範囲選択" && Array.isArray(value)) {
      const [start, end] = value;
      let temp = [];
      let cur = new Date(start);
      while (cur <= end) {
        temp.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      setSelectedDates(temp);
    } else if (rangeMode === "複数選択") {
      setSelectedDates((prev) =>
        prev.find((d) => d.toDateString() === value.toDateString())
          ? prev.filter((d) => d.toDateString() !== value.toDateString())
          : [...prev, value]
      );
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg space-y-6">
        <h2 className="text-2xl font-bold text-[#004CA0]">共有スケジュール</h2>

        {/* ユーザー名入力 */}
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border rounded-lg text-black"
        />

        {/* カレンダー UI */}
        <div className="flex space-x-4">
          <label>
            <input
              type="radio"
              value="範囲選択"
              checked={rangeMode === "範囲選択"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            範囲選択
          </label>
          <label>
            <input
              type="radio"
              value="複数選択"
              checked={rangeMode === "複数選択"}
              onChange={(e) => setRangeMode(e.target.value)}
            />
            複数選択
          </label>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <Calendar
            selectRange={rangeMode === "範囲選択"}
            onChange={handleDateChange}
          />
        </div>

        {/* スケジュール一覧 + 回答 */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#004CA0] text-white">
              <th className="border border-gray-300 px-2 py-1">日付</th>
              <th className="border border-gray-300 px-2 py-1">タイトル</th>
              <th className="border border-gray-300 px-2 py-1">時間帯</th>
              <th className="border border-gray-300 px-2 py-1">回答</th>
            </tr>
          </thead>
          <tbody>
            {schedules && schedules.length > 0 ? (
              schedules.map((s) => (
                <tr key={s.id}>
                  <td className="border border-gray-300 px-2 py-1">{s.date}</td>
                  <td className="border border-gray-300 px-2 py-1">
                    {s.title}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    {s.timeslot}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">
                    <select
                      value={selected[s.id] || ""}
                      onChange={(e) =>
                        handleResponseChange(s.id, e.target.value)
                      }
                      className="p-1 rounded border text-black"
                    >
                      <option value="">選択</option>
                      <option value="〇">〇</option>
                      <option value="✖">✖</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-500 py-3 border"
                >
                  登録されたスケジュールはありません
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-[#FDB9C8] text-black rounded-lg font-bold hover:bg-pink-400"
        >
          保存
        </button>

        {/* 回答一覧 */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">回答一覧</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-1">ユーザー</th>
                <th className="border border-gray-300 px-2 py-1">回答</th>
              </tr>
            </thead>
            <tbody>
              {responses && responses.length > 0 ? (
                responses.map((r) => (
                  <tr key={r.id}>
                    <td className="border border-gray-300 px-2 py-1">
                      {r.username}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {r.response}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center text-gray-500 py-3 border"
                  >
                    まだ回答はありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
