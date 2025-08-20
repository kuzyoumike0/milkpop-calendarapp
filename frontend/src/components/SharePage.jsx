import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function SharePage() {
  const { linkId } = useParams();
  const [username, setUsername] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState([]);
  const [rangeMode, setRangeMode] = useState("範囲選択");
  const [selectedDates, setSelectedDates] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/schedules/${linkId}`);
      setSchedules(res.data.schedules);
      setResponses(res.data.responses);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [linkId]);

  const handleDateChange = (value) => {
    if (rangeMode === "範囲選択") {
      if (Array.isArray(value)) {
        const [start, end] = value;
        let temp = [];
        let cur = new Date(start);
        while (cur <= end) {
          temp.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        setSelectedDates(temp);
      }
    } else if (rangeMode === "複数選択") {
      setSelectedDates((prev) =>
        prev.find((d) => d.toDateString() === value.toDateString())
          ? prev.filter((d) => d.toDateString() !== value.toDateString())
          : [...prev, value]
      );
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(`/api/schedules/${linkId}/respond`, {
        username,
        dates: selectedDates.map((d) => d.toISOString().split("T")[0]),
      });
      fetchData();
    } catch (err) {
      alert("保存に失敗しました");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-center text-3xl font-bold text-[#FDB9C8] mb-6">
        MilkPOP Calendar - 共有スケジュール
      </header>

      <div className="max-w-4xl mx-auto bg-[#004CA0] p-6 rounded-2xl shadow-lg space-y-6">
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-xl text-black"
        />

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

        <div className="bg-white rounded-xl p-4">
          <Calendar
            selectRange={rangeMode === "範囲選択"}
            onChange={handleDateChange}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-[#FDB9C8] text-black rounded-xl font-bold hover:bg-pink-400"
        >
          保存
        </button>

        {/* 即時反映テーブル */}
        <table className="w-full bg-black text-white border border-gray-600 mt-6 rounded-xl overflow-hidden">
          <thead className="bg-[#FDB9C8] text-black">
            <tr>
              <th className="p-2">日付</th>
              <th className="p-2">時間帯</th>
              <th className="p-2">ユーザー</th>
              <th className="p-2">回答</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r, i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{r.timeslot}</td>
                <td className="p-2">{r.username}</td>
                <td className="p-2">{r.response}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
