// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../common.css";
import "../share.css";

const attendanceOptions = ["-", "○", "✖", "△"];

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [allResponses, setAllResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [editingCell, setEditingCell] = useState(null); // {key}

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        const data = await res.json();
        if (!data.error) setSchedule(data);
      } catch (err) {
        console.error("共有スケジュール読み込みエラー", err);
      }
    };
    fetchSchedule();
  }, [token]);

  // ===== 回答一覧取得 =====
  const fetchResponses = async () => {
    try {
      const res = await fetch(`/api/schedules/${token}/responses`);
      const data = await res.json();
      if (!data.error) setAllResponses(data);
    } catch (err) {
      console.error("回答一覧取得エラー", err);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [token]);

  // ===== 自分の出欠変更 =====
  const handleUpdateResponse = async (key, value) => {
    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          responses: { [key]: value },
        }),
      });
      fetchResponses();
      setEditingCell(null);
    } catch (err) {
      console.error("更新エラー", err);
    }
  };

  if (!schedule) return <div className="share-page">読み込み中...</div>;

  // ===== 名前が必須 =====
  if (!username) {
    return (
      <div className="share-page">
        <h2 className="page-title">共有スケジュール</h2>
        <div className="glass-black title-box">{schedule.title}</div>
        <div className="glass-black name-box">
          <input
            type="text"
            placeholder="あなたの名前を入力（必須）"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <p className="notice-text">※名前を入力してください。入力後に表が表示されます。</p>
      </div>
    );
  }

  // ===== ユーザー一覧（自分も必ず含める） =====
  let users = Array.from(new Set(allResponses.map((r) => r.username)));
  if (username && !users.includes(username)) users.push(username);

  return (
    <div className="share-page">
      <h2 className="page-title">共有スケジュール</h2>

      {/* タイトル */}
      <div className="glass-black title-box">{schedule.title}</div>

      {/* 名前入力 */}
      <div className="glass-black name-box">
        <input
          type="text"
          placeholder="あなたの名前を入力（必須）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* デイコード/伝助風テーブル */}
      <div className="glass-black schedule-list">
        <table>
          <thead>
            <tr>
              <th>日付</th>
              <th>時間</th>
              {users.map((u, idx) => (
                <th key={idx}>{u}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(schedule.dates) &&
              schedule.dates.map((d, i) => {
                const key = `${d.date} (${d.time})`;

                return (
                  <tr key={i}>
                    <td className="date-cell">{d.date}</td>
                    <td className="time-cell">{d.time}</td>
                    {users.map((u, idx) => {
                      const user = allResponses.find((r) => r.username === u);
                      const value = user?.responses?.[key] || "-";
                      const cellId = `${u}-${key}`;
                      const isSelf = u === username;

                      return (
                        <td key={idx} className="attendance-cell">
                          {isSelf && editingCell === cellId ? (
                            <select
                              autoFocus
                              defaultValue={value}
                              onBlur={() => setEditingCell(null)}
                              onChange={(e) => handleUpdateResponse(key, e.target.value)}
                              className="response-dropdown"
                            >
                              {attendanceOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : isSelf ? (
                            <a
                              href="#!"
                              className="user-link"
                              onClick={() => setEditingCell(cellId)}
                            >
                              {value}
                            </a>
                          ) : (
                            value
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SharePage;
