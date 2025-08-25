// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../common.css";
import "../share.css";

const userOptions = ["Aさん", "Bさん", "Cさん", "Dさん"];

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});
  const [allResponses, setAllResponses] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        const data = await res.json();
        if (!data.error) {
          setSchedule(data);
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
      }
    } catch (err) {
      console.error("回答一覧取得エラー", err);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [token]);

  // ===== 出欠変更 =====
  const handleChange = (key, value) => {
    setResponses({ ...responses, [key]: value });
  };

  // ===== 保存 =====
  const handleSave = async () => {
    try {
      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Math.random().toString(36).slice(2, 8),
          username: username || "匿名",
          responses,
        }),
      });

      fetchResponses(); // 保存後即反映
      alert("保存しました！");
    } catch (err) {
      console.error("保存エラー", err);
    }
  };

  // ===== ユーザー編集切替 =====
  const handleEditUser = (user) => {
    setEditingUser(editingUser === user.user_id ? null : user.user_id);
  };

  // ===== ユーザー名変更 =====
  const handleUserChange = async (user, newName) => {
    try {
      await fetch(`/api/schedules/${token}/responses/${user.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newName }),
      });
      fetchResponses();
      setEditingUser(null);
    } catch (err) {
      console.error("ユーザー名更新エラー", err);
    }
  };

  // ===== 削除 =====
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`${user.username} さんの回答を削除しますか？`)) return;
    try {
      await fetch(`/api/schedules/${token}/responses/${user.user_id}`, {
        method: "DELETE",
      });
      fetchResponses();
    } catch (err) {
      console.error("削除エラー", err);
    }
  };

  if (!schedule) {
    return <div className="share-page">読み込み中...</div>;
  }

  return (
    <div className="share-page">
      <h2 className="page-title">共有スケジュール</h2>

      {/* タイトル */}
      <div className="glass-black title-box">{schedule.title}</div>

      {/* 名前入力 */}
      <div className="glass-black name-box">
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* 日程一覧 */}
      <div className="glass-black schedule-list">
        <h3>日程一覧</h3>
        <table>
          <thead>
            <tr>
              <th>日付</th>
              <th>時間</th>
              <th>ユーザー名</th>
              <th>出欠</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(schedule.dates) &&
              schedule.dates.map((d, i) => {
                const key = `${d.date} (${d.time})`;

                const users = allResponses.filter((r) => r.responses[key]);

                return (
                  <tr key={i}>
                    <td className="date-cell">{d.date}</td>
                    <td className="time-cell">{d.time}</td>
                    <td className="user-list">
                      {users.map((u, idx) => (
                        <div key={idx} className="user-entry">
                          {editingUser === u.user_id ? (
                            <select
                              className="user-dropdown"
                              value={u.username}
                              onChange={(e) =>
                                handleUserChange(u, e.target.value)
                              }
                              onBlur={() => setEditingUser(null)}
                            >
                              {userOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <a
                              href="#!"
                              onClick={() => handleEditUser(u)}
                              className="user-link"
                            >
                              {u.username}
                            </a>
                          )}
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteUser(u)}
                          >
                            削除
                          </button>
                        </div>
                      ))}
                    </td>
                    <td>
                      <select
                        value={responses[key] || "-"}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="response-dropdown"
                      >
                        <option value="-">-</option>
                        <option value="○">○</option>
                        <option value="✖">✖</option>
                        <option value="△">△</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* ボタン */}
      <div className="button-area">
        <button className="save-button" onClick={handleSave}>
          保存
        </button>
      </div>
    </div>
  );
};

export default SharePage;
