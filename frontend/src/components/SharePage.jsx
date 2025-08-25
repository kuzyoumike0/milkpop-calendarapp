// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../common.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [myResponses, setMyResponses] = useState({});

  // スケジュール取得
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error("スケジュール取得失敗");
        const data = await res.json();
        setSchedule(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchResponses = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}/responses`);
        if (!res.ok) throw new Error("回答取得失敗");
        const data = await res.json();
        setResponses(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSchedule();
    fetchResponses();
  }, [token]);

  // 出欠選択変更
  const handleSelectChange = (dateKey, value) => {
    setMyResponses({ ...myResponses, [dateKey]: value });
  };

  // 保存
  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("user_id") || crypto.randomUUID();
      localStorage.setItem("user_id", userId);

      const res = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          username: username || "匿名",
          responses: myResponses,
        }),
      });

      if (!res.ok) throw new Error("保存失敗");
      await res.json();

      // 再取得
      const updated = await fetch(`/api/schedules/${token}/responses`);
      setResponses(await updated.json());
      alert("保存しました ✅");
    } catch (err) {
      console.error(err);
      alert("保存エラー");
    }
  };

  if (!schedule) return <div>読み込み中...</div>;

  return (
    <div className="share-page">
      <h2>📌 共有スケジュール</h2>
      <h3>{schedule.title}</h3>

      {/* ユーザー名入力 */}
      <div className="username-box">
        <label>あなたの名前: </label>
        <input
          type="text"
          value={username}
          placeholder="匿名でも可"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* 日程と出欠プルダウン */}
      <div className="schedule-list">
        <h4>日程一覧</h4>
        <ul>
          {schedule.dates.map((d, i) => {
            const key = `${d.date} (${d.time})`;
            return (
              <li key={i}>
                {key}{" "}
                <select
                  value={myResponses[key] || ""}
                  onChange={(e) => handleSelectChange(key, e.target.value)}
                >
                  <option value="">選択してください</option>
                  <option value="◯">◯</option>
                  <option value="✕">✕</option>
                </select>
              </li>
            );
          })}
        </ul>
        <button className="save-btn" onClick={handleSave}>
          保存
        </button>
      </div>

      {/* 既存回答一覧 */}
      <div className="responses-list">
        <h4>📝 回答一覧</h4>
        {responses.length === 0 ? (
          <p>まだ回答がありません</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ユーザー</th>
                {schedule.dates.map((d, i) => (
                  <th key={i}>{d.date} ({d.time})</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.username}</td>
                  {schedule.dates.map((d, i) => {
                    const key = `${d.date} (${d.time})`;
                    return <td key={i}>{r.responses[key] || "-"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SharePage;
