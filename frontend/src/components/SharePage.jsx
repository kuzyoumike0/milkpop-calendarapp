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

          // 初期レスポンスを "-" で準備
          if (Array.isArray(data.dates)) {
            const init = {};
            data.dates.forEach((d) => {
              const key =
                d.time === "時間指定" && d.start && d.end
                  ? `${d.date} (${d.start} ~ ${d.end})`
                  : `${d.date} (${d.time})`;
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
      // ユーザーを即追加
      setUsers((prev) => [...prev, username]);

      // allResponses に仮データを追加
      const dummy = { username, responses: { ...responses } };
      setAllResponses((prev) => {
        const filtered = prev.filter((r) => r.username !== username);
        return [...filtered, dummy];
      });

      setIsEditing(true); // ★ 新規追加直後は編集モードON
    }
  };

  // ===== 出欠クリック変更 =====
  const handleSelect = (key, value) => {
    if (!isEditing) return;
    setResponses((prev) => ({ ...prev, [key]: value }));

    // 表示も即更新
    setAllResponses((prev) =>
      prev.map((r) =>
        r.username === username
          ? { ...r, responses: { ...r.responses, [key]: value } }
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
    try {
      const payload = { username, responses };

      await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 即反映
      setAllResponses((prev) => {
        const filtered = prev.filter((r) => r.username !== username);
        return [...filtered, payload];
      });

      setIsEditing(false); // ★ 保存後は編集終了
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
                // 時間指定なら開始〜終了をそのまま文字列化（日をまたぐケースも許す）
                const timeLabel =
                  d.time === "時間指定" && d.start && d.end
                    ? `${d.start} ~ ${d.end}`
                    : d.time;

                const key =
                  d.time === "時間指定" && d.start && d.end
                    ? `${d.date} (${d.start} ~ ${d.end})`
                    : `${d.date} (${d.time})`;

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
                        ? responses[key] || "-"
                        : userResp?.responses?.[key] || "-";

                      return (
                        <td key={idx} className="attendance-cell">
                          {isSelf ? (
                            <div className="choice-buttons">
                              {attendanceOptions.map((opt) => (
                                <button
                                  key={opt}
                                  className={`choice-btn ${
                                    value === opt ? "active" : ""
                                  } ${isEditing ? "" : "disabled"}`}
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
          <button
            className="save-button"
            onClick={handleSave}
            disabled={!isEditing}
          >
            保存する
          </button>
        </div>
      )}
    </div>
  );
};

export default SharePage;
