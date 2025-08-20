import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState([]);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});

  const fetchData = async () => {
    const res = await axios.get(`/api/schedule/${linkid}`);
    setSchedule(res.data.schedules);
    setResponses(res.data.responses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (date, value) => {
    setAnswers((prev) => ({ ...prev, [date]: value }));
  };

  const saveResponse = async () => {
    await axios.post(`/api/share/${linkid}/response`, {
      username,
      answers,
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">共有スケジュール回答</h2>
      <input
        className="w-full p-2 rounded bg-black/20"
        placeholder="名前"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <table className="w-full text-center border-collapse">
        <thead>
          <tr>
            <th className="p-2 border">日付</th>
            <th className="p-2 border">時間帯</th>
            <th className="p-2 border">回答</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((s) => (
            <tr key={s.id}>
              <td className="border p-2">{s.date}</td>
              <td className="border p-2">{s.timeslot}</td>
              <td className="border p-2">
                <select
                  className="bg-black/20 p-1 rounded"
                  value={answers[s.date] || ""}
                  onChange={(e) => handleChange(s.date, e.target.value)}
                >
                  <option value="">未選択</option>
                  <option value="◯">◯</option>
                  <option value="✖">✖</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="px-6 py-2 bg-green-500 rounded shadow hover:bg-green-600"
        onClick={saveResponse}
      >
        保存
      </button>

      <div>
        <h3 className="text-xl font-bold mt-6">回答一覧</h3>
        <ul className="space-y-2">
          {responses.map((r, i) => (
            <li key={i} className="p-2 bg-white/10 rounded">
              {r.username}: {JSON.stringify(r.answers)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
