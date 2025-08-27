// frontend/src/components/SharePage.jsx
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
  const [username, setUsername] = useState("");
  const [userId] = useState(() => crypto.randomUUID());
  const [responses, setResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");
  const [filter, setFilter] = useState("all");

  // 🔹ユーザ名編集モード
  const [editingUser, setEditingUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error("スケジュール取得失敗");
        const data = await res.json();
        setSchedule({
          ...data,
          dates: data.dates || [],
        });

        const res2 = await fetch(`/api/schedules/${token}/responses`);
        if (!res2.ok) throw new Error("レスポンス取得失敗");
        const data2 = await res2.json();
        setAllResponses(data2);
      } catch (err) {
        console.error("API取得エラー:", err);
      }
    };
    fetchSchedule();

    socket.emit("joinSchedule", token);
    socket.on("updateResponses", (newRes) => {
      setAllResponses((prev) => {
        const others = prev.filter((r) => r.user_id !== newRes.user_id);
        return [...others, newRes];
      });
    });
    socket.on("deleteResponse", ({ user_id }) => {
      setAllResponses((prev) => prev.filter((r) => r.user_id !== user_id));
    });

    return () => {
      socket.off("updateResponses");
      socket.off("deleteResponse");
    };
  }, [token]);

  const handleChange = (dateKey, value) => {
    setResponses((prev) => ({
      ...prev,
      [dateKey]: value,
    }));
  };

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
    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res),
    });
    setSaveMessage("保存しました！");
  };

  const handleUsernameSave = async (oldName) => {
    if (!newUsername.trim()) return;
    await fetch(`/api/schedules/${token}/edit-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldName,
        newName: newUsername.trim(),
      }),
    });
    setEditingUser(null);
    setNewUsername("");
  };

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

  const filteredDates = schedule.dates.filter((d) => {
    const dateKey =
      d.timeType === "時間指定" && d.startTime && d.endTime
        ? `${d.date} (${d.startTime} ~ ${d.endTime})`
        : `${d.date} (${d.timeType})`;

    const aggregate = { "○": 0, "✖": 0, "△": 0 };
    allResponses.forEach((r) => {
      const ans = r.responses?.[dateKey];
      if (aggregate[ans] !== undefined) aggregate[ans]++;
    });

    if (filter === "good") return aggregate["○"] > aggregate["✖"];
    if (filter === "bad") return aggregate["✖"] >= aggregate["○"];
    return true;
  });

  return (
    <div className="share-container gradient-bg">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 自分の回答 */}
      <div className="my-responses card-box">
        <h2>自分の回答</h2>
        <input
          type="text"
          className="username-input cute-input"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="my-responses-list">
          {schedule?.dates?.map((d) => {
            const dateKey =
              d.timeType === "時間指定" && d.startTime && d.endTime
                ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                : `${d.date} (${d.timeType})`;
            return (
              <div key={dateKey} className="my-response-item">
                <span className="date-label">{formatDate(d)}</span>
                <select
                  className="fancy-select"
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
        </div>
        <button className="save-btn" onClick={handleSave}>保存する</button>
        {saveMessage && <p className="save-message">{saveMessage}</p>}
      </div>

      {/* みんなの回答 */}
      <div className="all-responses card-box">
        <h2>みんなの回答</h2>
        <div className="filter-box">
          <label>フィルタ: </label>
          <select
            className="fancy-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">すべて表示</option>
            <option value="good">○ が多い日</option>
            <option value="bad">✖ が多い日</option>
          </select>
        </div>
        <table className="responses-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>回答数</th>
              {uniqueUsers.map((user) => (
                <th key={user}>
                  {editingUser === user ? (
                    <div className="username-edit-box">
                      <input
                        type="text"
                        className="cute-input"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                      <button
                        className="mini-save-btn"
                        onClick={() => handleUsernameSave(user)}
                      >
                        保存
                      </button>
                    </div>
                  ) : (
                    <span
                      className="editable-username"
                      onClick={() => {
                        setEditingUser(user);
                        setNewUsername(user);
                      }}
                    >
                      {user}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDates.map((d) => {
              const dateKey =
                d.timeType === "時間指定" && d.startTime && d.endTime
                  ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                  : `${d.date} (${d.timeType})`;

              const aggregate = { "○": 0, "✖": 0, "△": 0 };
              allResponses.forEach((r) => {
                const ans = r.responses?.[dateKey];
                if (aggregate[ans] !== undefined) aggregate[ans]++;
              });

              return (
                <tr key={dateKey}>
                  <td>{formatDate(d)}</td>
                  <td>
                    <span className="count-ok">○{aggregate["○"]}</span>{" "}
                    <span className="count-ng">✖{aggregate["✖"]}</span>{" "}
                    <span className="count-maybe">△{aggregate["△"]}</span>
                  </td>
                  {uniqueUsers.map((user) => {
                    const userResponse = allResponses.find(
                      (r) => r.username === user
                    );
                    return (
                      <td key={user}>
                        {userResponse?.responses?.[dateKey] || "-"}
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
