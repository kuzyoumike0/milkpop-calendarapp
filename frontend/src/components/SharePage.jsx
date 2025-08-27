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

  // ===== フィルタリング =====
  const [filter, setFilter] = useState("all");

  // ===== スケジュール読み込み =====
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

  // ===== 入力変更 =====
  const handleChange = (dateKey, value) => {
    setResponses((prev) => ({
      ...prev,
      [dateKey]: value,
    }));
  };

  // ===== 保存 =====
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

  // ===== 日付フォーマット =====
  const formatDate = (d) => {
    const date = new Date(d.date);
    const base = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    if (d.timeType === "時間指定" && d.startTime && d.endTime) {
      return `${base} (${d.startTime} ~ ${d.endTime})`;
    }
    return `${base}（${d.timeType || "未定"}）`;
  };

  if (!schedule) return <div>読み込み中...</div>;

  // ユニークユーザー
  const uniqueUsers = [...new Set(allResponses.map((r) => r.username))];

  // ===== フィルタ処理 =====
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
    return true; // all
  });

  return (
    <div className="share-container">
      <h1 className="share-title">MilkPOP Calendar</h1>

      {/* 自分の回答 */}
      <div className="my-responses">
        <h2>自分の回答</h2>
        <input
          type="text"
          className="username-input"
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
      <div className="all-responses">
        <h2>みんなの回答</h2>

        {/* フィルタ */}
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
                <th key={user}>{user}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDates.map((d) => {
              const dateKey =
                d.timeType === "時間指定" && d.startTime && d.endTime
                  ? `${d.date} (${d.startTime} ~ ${d.endTime})`
                  : `${d.date} (${d.timeType})`;

              // 集計
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
