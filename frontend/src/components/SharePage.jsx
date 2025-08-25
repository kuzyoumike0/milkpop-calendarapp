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
  const [responses, setResponses] = useState({});

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        const data = await res.json();
        if (!data.error) {
          setSchedule(data);

          // 初期レスポンスを "-" で準備
          if (Array.isArray(data.dates)) {
            const init = {};
            data.dates.forEach((d) => {
              const key = `${d.date} (${d.time})`;
              init[key] = "-";
            });
            setResponses(init);
          }
        }
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

  // ===== 自分の出欠入力変更 =====
  const handleChange = (key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  // ===== 保存 =====
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください！（必須）");
      return;
    }
    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          responses,
        }),
      });
      fetchResponses();
      alert("保存しました！");
    } catch (err) {
      console.error("保存エラー", err);
    }
  };

  if (!schedule) return <div className="share-page">読み込み中...</div>;

  // ===== ユーザー一覧（自分の名前が入力されたら含める） =====
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

      {/* 日程一覧（常に表示） */}
      <div className="glass-black schedule-list">
        <table>
          <thead>
            <tr>
              <th>日付</th>
              <th>時間</th>
              {/* 自分の列（名前未入力なら「あなた」） */}
              <th>{username || "あなた"}</th>
              {/* 他のユーザー */}
              {users
                .filter((u) => u !== username)
                .map((u, idx) => (
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
                    {/* 自分の列：プルダウン */}
                    <td>
                      <select
                        value={responses[key] || "-"}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="response-dropdown"
                      >
                        {attendanceOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* 他ユーザー列：表示のみ */}
                    {users
                      .filter((u) => u !== username)
                      .map((u, idx) => {
                        const user = allResponses.find((r) => r.username === u);
                        const value = user?.responses?.[key] || "-";
                        return <td key={idx}>{value}</td>;
                      })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* 保存ボタン */}
      <div className="button-area">
        <button className="save-button" onClick={handleSave}>
          保存
        </button>
      </div>
    </div>
  );
};

export default SharePage;
