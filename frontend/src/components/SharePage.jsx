// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "../common.css";
import "../share.css";

const attendanceOptions = ["-", "○", "✖", "△"];
const socket = io(); // same origin

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [allResponses, setAllResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [responses, setResponses] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [aggregate, setAggregate] = useState({});

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
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
    };
    fetchSchedule();
  }, [token]);

  // ===== 回答一覧取得 =====
  const fetchResponses = async () => {
    const res = await fetch(`/api/schedules/${token}/responses`);
    const data = await res.json();
    if (!data.error) {
      setAllResponses(data);
      setUsers(data.map((r) => r.username));
    }
    fetchAggregate();
  };

  // ===== 集計取得 =====
  const fetchAggregate = async () => {
    const res = await fetch(`/api/schedules/${token}/aggregate`);
    const data = await res.json();
    if (!data.error) setAggregate(data);
  };

  useEffect(() => {
    fetchResponses();

    socket.emit("joinSchedule", token);
    socket.on("updateResponses", () => {
      fetchResponses();
    });

    return () => {
      socket.off("updateResponses");
    };
  }, [token]);

  // ===== 出欠クリック =====
  const handleSelect = (index, value) => {
    if (!isEditing) return;
    setResponses((prev) => ({ ...prev, [index]: value }));

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
    const payload = { user_id: username, username, responses };
    setAllResponses((prev) => {
      const filtered = prev.filter((r) => r.username !== username);
      return [...filtered, payload];
    });
    setIsEditing(false);

    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  if (!schedule) return <div className="share-page">読み込み中...</div>;

  return (
    <div className="share-page">
      <h2 className="page-title">共有スケジュール</h2>
      <div className="glass-black title-box">{schedule.title}</div>

      <div className="glass-black name-box">
        <input
          type="text"
          placeholder="あなたの名前（必須）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="add-button" onClick={() => setIsEditing(true)}>
          新規追加
        </button>
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
              <th>集計</th>
            </tr>
          </thead>
          <tbody>
            {schedule.dates.map((d, i) => {
              const timeLabel =
                d.time === "時間指定" && d.startTime && d.endTime
                  ? `${d.startTime} ~ ${d.endTime}`
                  : d.time;
              return (
                <tr key={i}>
                  <td>{d.date}</td>
                  <td>{timeLabel}</td>
                  {users.map((u, idx) => {
                    const userResp = allResponses.find((r) => r.username === u);
                    const isSelf = u === username;
                    const value = isSelf
                      ? responses[i] || "-"
                      : userResp?.responses?.[i] || "-";

                    return (
                      <td key={idx}>
                        {isSelf ? (
                          <div className="choice-buttons">
                            {attendanceOptions.map((opt) => (
                              <button
                                key={opt}
                                className={`choice-btn ${
                                  value === opt ? "active" : ""
                                } ${isEditing ? "" : "disabled"}`}
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
                  <td>
                    {aggregate[`${d.date} (${d.time})`]?.length
                      ? `○:${
                          aggregate[`${d.date} (${d.time})`].filter(
                            (r) => r.status === "○"
                          ).length
                        } ✖:${
                          aggregate[`${d.date} (${d.time})`].filter(
                            (r) => r.status === "✖"
                          ).length
                        } △:${
                          aggregate[`${d.date} (${d.time})`].filter(
                            (r) => r.status === "△"
                          ).length
                        }`
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
