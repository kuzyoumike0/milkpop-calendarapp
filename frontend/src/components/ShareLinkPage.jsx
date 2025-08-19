import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]); // 選択された日付
  const [answers, setAnswers] = useState([]); // ユーザー回答
  const [username, setUsername] = useState("");
  const [myChoices, setMyChoices] = useState({}); // { "2025-08-20": "◯" }

  // 日程取得
  useEffect(() => {
    axios.get(`/api/link/${linkId}`).then((res) => {
      setTitle(res.data.title);
      setDates(res.data.dates || []);
      setAnswers(res.data.answers || []);
    });
  }, [linkId]);

  // 回答送信
  const submit = async () => {
    try {
      await axios.post(`/api/link/${linkId}/answer`, {
        username,
        choices: myChoices,
      });
      const res = await axios.get(`/api/link/${linkId}`);
      setAnswers(res.data.answers || []);
    } catch (err) {
      console.error(err);
      alert("送信失敗");
    }
  };

  // マトリクス表で表示
  return (
    <div style={{ padding: "1rem" }}>
      <h2>{title}</h2>

      <label>
        名前:
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        />
      </label>

      <table border="1" cellPadding="5" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>自分の回答</th>
            {answers.map((a, i) => (
              <th key={i}>{a.username}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((d) => (
            <tr key={d}>
              <td>{d}</td>
              <td>
                <select
                  value={myChoices[d] || ""}
                  onChange={(e) =>
                    setMyChoices({ ...myChoices, [d]: e.target.value })
                  }
                >
                  <option value="">-</option>
                  <option value="◯">◯</option>
                  <option value="×">×</option>
                </select>
              </td>
              {answers.map((a, i) => (
                <td key={i}>{a.choices?.[d] || "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={submit} style={{ marginTop: "1rem" }}>
        回答を送信
      </button>
    </div>
  );
}
