import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "../common.css";
import "../share.css";

const attendanceOptions = ["-", "○", "✖", "△"];
const socket = io();

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [allResponses, setAllResponses] = useState([]);

  // 自分の回答
  const [username, setUsername] = useState("");
  const [userId] = useState(() => crypto.randomUUID());
  const [responses, setResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  // 編集中セル
  const [editingCells, setEditingCells] = useState({});

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      const res1 = await fetch(`/api/schedules/${token}`);
      if (!res1.ok) return;
      const data1 = await res1.json();
      setSchedule({ ...data1, dates: data1.dates || [] });

      const res2 = await fetch(`/api/schedules/${token}/responses`);
      if (!res2.ok) return;
      const data2 = await res2.json();
      setAllResponses(data2);

      // もし自分の回答があればロード
      const myRes = data2.find((r) => r.user_id === userId);
      if (myRes) {
        setUsername(myRes.username);
        setResponses(myRes.responses);
      }
    };
    fetchData();

    socket.emit("joinSchedule", token);
    socket.on("updateResponses", (newRes) => {
      setAllResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== newRes.user_id);
        return [...others, newRes];
      });
    });

    return () => {
      socket.off("updateResponses");
    };
  }, [token, userId]);

  // 自分の入力変更
  const handleChange = (dateKey, value) => {
    setResponses((prev) => ({
      ...prev,
      [dateKey]: value,
    }));
  };

  // 自分の保存
  const handleSave = async () => {
    if (!username) {
      setSaveMessage("名前を入力してください");
      return;
    }
    const res = {
      user_id: userId,
      username,
      responses,
    };
    const response = await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res),
    });
    const data = await response.json();

    setAllResponses((prev) => {
      const others = prev.filter((r) => r.user_id !== data.user_id);
      return [...others, data];
    });

    setSaveMessage("保存しました！");
  };

  // みんなの回答セル編集
  const handleEditCell = (user, dateKey, currentValue) => {
    setEditingCells((prev) => ({
      ...prev,
      [user.user_id]: {
        ...(prev[user.user_id] || {}),
        [dateKey]: currentValue,
      },
    }));
  };

  const handleChangeCell = (user, dateKey, value) => {
    setEditingCells((prev) => ({
      ...prev,
      [user.user_id]: {
        ...(prev[user.user_id] || {}),
        [dateKey]: value,
      },
    }));
  };

  const handleSaveAll = async () => {
    for (const user_id of Object.keys(editingCells)) {
      const user = allResponses.find((r) => r.user_id === user_id);
      if (!user) continue;

      const newResponses = {
        ...user.responses,
        ...editingCells[user_id],
      };

      const response = await fetch(`/api/schedules/${token}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          username: user.username,
          responses: newResponses,
        }),
      });
      const data = await response.json();

      setAllResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== data.user_id);
        return [...others, data];
      });
    }

    setEditingCells({});
    alert("保存しました！");
  };

  // 日付表示
  const formatDate = (d) => {
    const date = new Date(d.date);
    const base = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    if (d.timeType === "時間指定" && d.startTime && d.endTime) {
      return `${base} (${d.startTime} ~ ${d.endTime})`;
    }
    return `${base}（${d.timeType || "未定"}）`;
  };

  if (!schedule) return <div>読み込み中...</div>;

  const uniqueUsers = [...new Set(allResponses.map((r) => r.username))];

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* ✅ 自分の回答フォーム */}
      <div className="response-form">
        <h2>自分の回答</h2>
        <input
          type="text"
          className="username-input"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {schedule?.dates?.map((d) => {
          const dateKey =
            d.timeType === "時間指定" && d.startTime && d.endTime
              ? `${d.date} (${d.startTime} ~ ${d.endTime})`
              : `${d.date} (${d.timeType})`;
          return (
            <div key={dateKey} className="date-response">
              <span className="date-label">{formatDate(d)}</span>
              <select
                className="attendance-select"
                value={responses[dateKey] || "-"}
                onChange={(e) => handleChange(dateKey, e.target.value)}
              >
                {attendanceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        <button className="save-btn" onClick={handleSave}>
          保存する
        </button>
        {saveMessage && <p className="save-message">{saveMessage}</p>}
      </div>

      {/* ✅ みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>
        <table className="responses-table">
          <thead>
            <tr>
              <th>日程</th>
              {uniqueUsers.map((user) => (
                <th key={user}>{user}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule?.dates?.map((d) => {
              const dateKey =
                d.timeType === "時間指定" && d.startTime && d.endTime
                  ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                  : `${d.date} (${d.timeType})`;

              return (
                <tr key={dateKey}>
                  <td>{formatDate(d)}</td>
                  {uniqueUsers.map((user) => {
                    const userResponse = allResponses.find(
                      (r) => r.username === user
                    );
                    const user_id = userResponse?.user_id;
                    const currentValue =
                      editingCells[user_id]?.[dateKey] ??
                      userResponse?.responses?.[dateKey] ??
                      "-";

                    const isEditing =
                      editingCells[user_id] &&
                      editingCells[user_id][dateKey] !== undefined;

                    return (
                      <td
                        key={user}
                        className="editable-cell"
                        onClick={() =>
                          !isEditing &&
                          handleEditCell(userResponse, dateKey, currentValue)
                        }
                      >
                        {isEditing ? (
                          <select
                            className="attendance-select"
                            value={currentValue}
                            onChange={(e) =>
                              handleChangeCell(userResponse, dateKey, e.target.value)
                            }
                          >
                            {attendanceOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          currentValue
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {Object.keys(editingCells).length > 0 && (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSaveAll}>
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;
