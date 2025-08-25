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
  const [users, setUsers] = useState([]); 
  const [responses, setResponses] = useState({});
  const [isEditing, setIsEditing] = useState(true); // 初期から編集モード

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

  // ===== 新規追加 =====
  const handleAddUser = () => {
    if (!username) {
      alert("名前を入力してください！");
      return;
    }
    if (!users.includes(username)) {
      setUsers((prev) => [...prev, username]);
      setIsEditing(true); // 初期から編集可能
    }
  };

  // ===== 出欠クリック変更 =====
  const handleSelect = (key, value) => {
    if (!isEditing) return;
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
      await fetchResponses();
      setIsEditing(false); // 保存したら編集終了
      alert("保存しました！");
    } catch (err) {
      console.error("保存エラー", err);
    }
  };

  if (!schedule) return <div className="share-page">読み込み中...</div>;

  return (
    <div className="share-page">
      <h2 className="page-title">共有スケジュール</h2>

      {/* タイトル */}
      <div className="glass-black title-box">{schedule.title}</div>

      {/* 名前入力 + 新規追加 + 編集ボタン */}
      <div className="glass-black name-box">
        <input
          type="text"
          placeholder="あなたの名前を入力（必須）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="add-button" onClick={handleAddUser}>
          新規追加
        </button>
        {users.includes(username) && (
          <button
            className="edit-button"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? "編集終了" : "編集"}
          </button>
        )}
      </div>

      {/* 日程一覧 */}
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
                      const isSelf = u === username;
                      const value = isSelf
                        ? responses[key] || "-"
                        : allResponses.find((r) => r.username === u)?.responses?.[key] || "-";

                      return (
                        <td key={idx} className="attendance-cell">
                          {isSelf ? (
                            <div className="choice-buttons">
                              {attendanceOptions.map((opt) => (
                                <button
                                  key={opt}
                                  className={`choice-btn ${value === opt ? "active" : ""} ${
                                    isEditing ? "" : "disabled"
                                  }`}
                                  onClick={() => handleSelect(key, opt)}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
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

      {/* 保存ボタン */}
      {users.includes(username) && (
        <div className="button-area">
          <button className="save-button" onClick={handleSave} disabled={!isEditing}>
            保存する
          </button>
        </div>
      )}
    </div>
  );
};

export default SharePage;
