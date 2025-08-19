import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState({});
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    axios.get(`/api/share/${linkid}`).then((res) => {
      setSchedules(res.data.schedules);
      setResponses(res.data.responses);
    });
  }, [linkid]);

  const handleSave = async () => {
    for (const sid of Object.keys(answers)) {
      await axios.post("/api/respond", {
        scheduleId: sid,
        username,
        response: answers[sid],
      });
    }
    const res = await axios.get(`/api/share/${linkid}`);
    setResponses(res.data.responses);
  };

  return (
    <div>
      <h2>共有スケジュール</h2>
      <div>
        名前:{" "}
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <table border="1">
        <thead>
          <tr>
            <th>日付</th>
            <th>タイトル</th>
            <th>時間帯</th>
            <th>回答</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr key={s.id}>
              <td>{s.date}</td>
              <td>{s.title}</td>
              <td>{s.timeslot}</td>
              <td>
                <select
                  value={answers[s.id] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [s.id]: e.target.value })
                  }
                >
                  <option value="">選択</option>
                  <option value="○">○</option>
                  <option value="✖">✖</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave}>保存</button>
      <h3>回答一覧</h3>
      <ul>
        {responses.map((r) => (
          <li key={r.id}>
            {r.username}: {r.response}
          </li>
        ))}
      </ul>
    </div>
  );
}
