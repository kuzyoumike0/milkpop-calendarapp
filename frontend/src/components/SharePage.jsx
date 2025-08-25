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
  const [isEditing, setIsEditing] = useState(false);

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        const data = await res.json();
        if (!data.error) {
          setSchedule(data);

          if (Array.isArray(data.dates)) {
            const init = {};
            data.dates.forEach((_, i) => {
              init[i] = "-";
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
      if (!data.error) {
        setAllResponses(data);
        setUsers(data.map((r) => r.username));
      }
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

      // 仮データを表に追加
      const dummy = { username, responses: { ...responses } };
      setAllResponses((prev) => [...prev, dummy]);

      setIsEditing(true); // 編集モードON
    }
  };

  // ===== 出欠クリック変更 =====
  const handleSelect = (index, value) => {
    if (!isEditing) return;

    setResponses((prev) => ({ ...prev, [index]: value }));

    // 表も即更新
    setAllResponses((prev) =>
      prev.map((r) =>
        r.username === username
          ? { ...r, responses: { ...r.responses, [index]: value } }
          : r
      )
    );
  };

  // ===== 保存 =====
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください！（必須）");
      return;
    }

    const payload = { user_id: username, username, responses };

    // ローカル更新（即表に確定）
    setAllResponses((prev) => {
      const filtered = prev.filter((r) => r.username !== username);
      return [...filtered, payload];
    });

    setIsEditing(false); // 編集終了にする

    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      fetchResponses(); // サーバー最新状態と同期
    } catch (err) {
      console.error("保存エラー", err);
      alert("保存に失敗しました");
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
                const timeLabel =
                  d.time === "時間指定" && d.startTime && d.endTime
                    ? `${d.startTime} ~ ${d.endTime}`
                    : d.time;

                return (
                  <tr key={i}>
                    <td className="date-cell">{d.date}</td>
                    <td className="time-cell">{timeLabel}</td>
                    {users.map((u, idx) => {
                      const userResp = allResponses.find(
                        (r) => r.username === u
                      );
                      const isSelf = u === username;
                      const value = isSelf
                        ? responses[i] || "-"
                        : userResp?.responses?.[i] || "-";

                      return (
                        <td key={idx} className="attendance-cell">
                          {isSelf && isEditing ? (
                            <div className="choice-buttons">
                              {attendanceOptions.map((opt) => (
                                <button
                                  key={opt}
                                  className={`choice-btn ${
                                    value === opt ? "active" : ""
                                  }`}
                                  onClick={() => handleSelect(i, opt)}
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
      {users.includes(username) && isEditing && (
        <div className="button-area">
          <button className="save-button" onClick={handleSave}>
            保存する
          </button>
        </div>
      )}
    </div>
  );
};

export default SharePage;
