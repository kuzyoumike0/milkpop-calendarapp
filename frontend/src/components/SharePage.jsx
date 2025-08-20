import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});

  const fetchData = async () => {
    const res = await axios.get(`/api/schedule/${linkid}`);
    setSchedule(res.data.schedules[0]);
    setResponses(res.data.responses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAnswerChange = (date, value) => {
    setAnswers({ ...answers, [date]: value });
  };

  const handleSave = async () => {
    await axios.post(`/api/share/${linkid}/response`, {
      username,
      answers,
    });
    fetchData();
  };

  if (!schedule) return <p>読み込み中...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">
        共有スケジュール: {schedule.title}
      </h2>

      <div className="mb-4">
        <label>名前: </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
        />
      </div>

      <table className="table-auto border-collapse border border-gray-600 w-full mb-6">
        <thead>
          <tr className="bg-gray-800">
            <th className="border px-2">日付</th>
            <th className="border px-2">自分の回答</th>
          </tr>
        </thead>
        <tbody>
          {schedule.dates.map((d, i) => (
            <tr key={i}>
              <td className="border px-2">{d}</td>
              <td className="border px-2">
                <select
                  onChange={(e) => handleAnswerChange(d, e.target.value)}
                  className="bg-gray-800 text-white p-1"
                >
                  <option value="">選択</option>
                  <option value="〇">〇</option>
                  <option value="✖">✖</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        className="bg-[#004CA0] text-white px-6 py-2 rounded-2xl hover:bg-blue-900"
      >
        保存
      </button>

      <h3 className="mt-6 text-xl font-bold">回答一覧</h3>
      <table className="table-auto border-collapse border border-gray-600 w-full">
        <thead>
          <tr className="bg-gray-800">
            <th className="border px-2">ユーザー</th>
            {schedule.dates.map((d, i) => (
              <th key={i} className="border px-2">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {responses.map((r, i) => (
            <tr key={i}>
              <td className="border px-2">{r.username}</td>
              {schedule.dates.map((d, j) => (
                <td key={j} className="border px-2">
                  {r.answers[d] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
