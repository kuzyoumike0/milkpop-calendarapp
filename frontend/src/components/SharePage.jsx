import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "../share.css";

const attendanceOptions = [
  { value: "-", label: "－", class: "opt-none" },
  { value: "○", label: "○ 出席", class: "opt-ok" },
  { value: "✖", label: "✖ 欠席", class: "opt-ng" },
  { value: "△", label: "△ 未定", class: "opt-maybe" },
];
const socket = io();

const SharePage = () => {
  const { token } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [allResponses, setAllResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [userId] = useState(() => crypto.randomUUID());
  const [responses, setResponses] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  // 編集中のユーザ
  const [editingUser, setEditingUser] = useState(null);
  const [editValues, setEditValues] = useState({});

  // フィルター
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!token) return;

    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/${token}`);
        if (!res.ok) throw new Error("スケジュール取得失敗");
        const data = await res.json();
        setSchedule({ ...data, dates: data.dates || [] });

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

  // 自分の回答保存
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

  // 編集開始
  const startEdit = (user) => {
    setEditingUser(user);
    const target = allResponses.find((r) => r.username === user);
    setEditValues({ ...(target?.responses || {}) });
  };

  // 値変更
  const changeEditValue = (dateKey, value) => {
    setEditValues((prev) => ({ ...prev, [dateKey]: value }));
  };

  // 編集保存
  const saveEdit = async () => {
    if (!editingUser) return;
    const target = allResponses.find((r) => r.username === editingUser);
    if (!target) return;

    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: target.user_id,
        username: target.username,
        responses: editValues,
      }),
    });

    setEditingUser(null);
    setEditValues({});
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

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 自分の回答 */}
      <div className="my-responses">
        <h2>自分の回答</h2>
        <input
          type="text"
          className="username-input short"
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
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [dateKey]: e.target.value,
                    }))
                  }
                >
                  {attendanceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className={opt.class}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        <button className="save-btn" onClick={handleSave}>
          保存する
        </button>
        {saveMessage && <p className="save-message">{saveMessage}</p>}
      </div>

      {/* みんなの回答 */}
      <div className="all-responses">
        <h2>みんなの回答</h2>

        {/* フィルター */}
        <div className="filter-box">
          フィルタ:{" "}
          <select
            className="fancy-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">すべて表示</option>
            <option value="ok">○がある日だけ</option>
            <option value="ng">✖がある日だけ</option>
            <option value="maybe">△がある日だけ</option>
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
                    <>
                      <span>{user}</span>
                      <button className="mini-save-btn" onClick={saveEdit}>
                        保存
                      </button>
                    </>
                  ) : (
                    <span
                      className="editable-username"
                      onClick={() => startEdit(user)}
                    >
                      {user}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule?.dates
              ?.filter((d) => {
                const dateKey =
                  d.timeType === "時間指定" && d.startTime && d.endTime
                    ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                    : `${d.date} (${d.timeType})`;

                const counts = { "○": 0, "✖": 0, "△": 0 };
                allResponses.forEach((r) => {
                  const val = r.responses?.[dateKey];
                  if (counts[val] !== undefined) counts[val]++;
                });

                if (filter === "ok" && counts["○"] === 0) return false;
                if (filter === "ng" && counts["✖"] === 0) return false;
                if (filter === "maybe" && counts["△"] === 0) return false;

                return true;
              })
              .map((d) => {
                const dateKey =
                  d.timeType === "時間指定" && d.startTime && d.endTime
                    ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                    : `${d.date} (${d.timeType})`;

                const counts = { "○": 0, "✖": 0, "△": 0 };
                allResponses.forEach((r) => {
                  const val = r.responses?.[dateKey];
                  if (counts[val] !== undefined) counts[val]++;
                });

                return (
                  <tr key={dateKey}>
                    <td>{formatDate(d)}</td>
                    <td>
                      <span className="count-ok">○{counts["○"]}</span>{" "}
                      <span className="count-ng">✖{counts["✖"]}</span>{" "}
                      <span className="count-maybe">△{counts["△"]}</span>
                    </td>
                    {uniqueUsers.map((user) => {
                      const userResponse = allResponses.find(
                        (r) => r.username === user
                      );
                      const val = userResponse?.responses?.[dateKey] || "-";

                      if (editingUser === user) {
                        return (
                          <td key={user}>
                            <select
                              className="fancy-select"
                              value={editValues[dateKey] || "-"}
                              onChange={(e) =>
                                changeEditValue(dateKey, e.target.value)
                              }
                            >
                              {attendanceOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      }

                      return <td key={user}>{val}</td>;
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
