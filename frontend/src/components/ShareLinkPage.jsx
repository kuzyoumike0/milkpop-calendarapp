import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ShareLinkPage() {
  const { id } = useParams(); // /share/:id
  const [title, setTitle] = useState("");
  const [schedules, setSchedules] = useState([]); // [{date, timeslot}]
  const [responses, setResponses] = useState({}); // { "2025-08-19|昼": { "Alice": "◯", "Bob": "×" } }
  const [username, setUsername] = useState("");
  const [choices, setChoices] = useState({});

  useEffect(() => {
    axios
      .get(`/api/links/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setSchedules(res.data.schedules || []);
        setResponses(res.data.responses || {}); // サーバーが回答一覧を返す
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleChoiceChange = (date, timeslot, value) => {
    const key = `${date}|${timeslot}`;
    setChoices((prev) => ({ ...prev, [key]: value }));
  };

  const submitChoices = async () => {
    try {
      await axios.post(`/api/links/${id}/schedules`, {
        username,
        choices,
      });
      alert("回答を保存しました！");
      window.location.reload(); // 再取得して更新
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  // すべてのユーザー名を収集
  const allUsers = Array.from(
    new Set(
      Object.values(responses)
        .flatMap((resp) => Object.keys(resp))
        .concat(username ? [username] : [])
    )
  );

  return (
    <div style={{ padding: "1rem" }}>
      <h2>共有スケジュール: {title}</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <table border="1" cellPadding="5" style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>時間帯</th>
            {allUsers.map((u) => (
              <th key={u}>{u}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, idx) => {
            const key = `${s.date}|${s.timeslot}`;
            return (
              <tr key={idx}>
                <td>{s.date}</td>
                <td>{s.timeslot}</td>
                {allUsers.map((u) => (
                  <td key={u}>
                    {u === username ? (
                      <select
                        value={choices[key] || responses[key]?.[u] || ""}
                        onChange={(e) =>
                          handleChoiceChange(s.date, s.timeslot, e.target.value)
                        }
                      >
                        <option value="">未選択</option>
                        <option value="◯">◯</option>
                        <option value="×">×</option>
                      </select>
                    ) : (
                      responses[key]?.[u] || ""
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <button onClick={submitChoices} style={{ marginTop: "1rem" }}>
        保存する
      </button>
    </div>
  );
}

export default ShareLinkPage;
