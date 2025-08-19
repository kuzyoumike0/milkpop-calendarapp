import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ShareLinkPage() {
  const { id } = useParams(); // /share/:id のパラメータ
  const [title, setTitle] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [username, setUsername] = useState("");
  const [choices, setChoices] = useState({}); // { "2025-08-19|昼": "◯" }

  useEffect(() => {
    // リンク先の情報を取得
    axios
      .get(`/api/links/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setSchedules(res.data.schedules || []);
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
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

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
            <th>可否</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, idx) => {
            const key = `${s.date}|${s.timeslot}`;
            return (
              <tr key={idx}>
                <td>{s.date}</td>
                <td>{s.timeslot}</td>
                <td>
                  <select
                    value={choices[key] || ""}
                    onChange={(e) =>
                      handleChoiceChange(s.date, s.timeslot, e.target.value)
                    }
                  >
                    <option value="">未選択</option>
                    <option value="◯">◯</option>
                    <option value="×">×</option>
                  </select>
                </td>
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

export default ShareLinkPage;  // ✅ デフォルトエクスポート
