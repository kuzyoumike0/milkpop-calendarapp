import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});

  const fetchData = async () => {
    const res = await axios.get(`/api/schedule/${linkid}`);
    setSchedules(res.data.schedules);
    setResponses(res.data.responses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelect = (date, value) => {
    setAnswers({ ...answers, [date]: value });
  };

  const handleSubmit = async () => {
    await axios.post(`/api/share/${linkid}/response`, {
      username,
      answers,
    });
    fetchData();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#004CA0]">共有スケジュール</h2>
      <input
        type="text"
        placeholder="名前を入力"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <table className="table-auto w-full border">
        <thead className="bg-[#FDB9C8]">
          <tr>
            <th className="border px-2 py-1">日付</th>
            <th className="border px-2 py-1">判定</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, i) =>
            s.dates.map((d, j) => (
              <tr key={`${i}-${j}`}>
                <td className="border px-2 py-1">{d} ({s.timeslot})</td>
                <td className="border px-2 py-1">
                  <select
                    value={answers[d] || ""}
                    onChange={(e) => handleSelect(d, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="">未選択</option>
                    <option value="〇">〇</option>
                    <option value="✖">✖</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button
        onClick={handleSubmit}
        className="bg-[#004CA0] text-white px-6 py-2 mt-6 rounded shadow hover:scale-105"
      >
        保存
      </button>

      <div className="mt-6">
        <h3 className="text-lg font-bold mb-2">登録済み回答</h3>
        <table className="table-auto w-full border">
          <thead className="bg-black text-white">
            <tr>
              <th className="border px-2 py-1">ユーザー</th>
              <th className="border px-2 py-1">回答</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{r.username}</td>
                <td className="border px-2 py-1">
                  {Object.entries(r.answers).map(([d, v]) => (
                    <span key={d}>{d}: {v}　</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
