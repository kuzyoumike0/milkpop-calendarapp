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

  // ===== 日付フォーマット（YYYY年M月D日(曜)） =====
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("ja-JP", { weekday: "short" });
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) + `(${weekday})`;
  };

  // ===== スケジュール読み込み =====
  useEffect(() => {
    const fetchSchedule = async () => {
      const res = await fetch(`/api/schedules/${token}`);
      if (res.ok) {
        const data = await res.json();
        // 日付でソートして保持
        data.dates.sort((a, b) => new Date(a.date) - new Date(b.date));
        setSchedule(data);
      }
    };
    fetchSchedule();

    socket.emit("join", token);

    socket.on("updateResponses", (data) => {
      setAllResponses(data);
    });

    return () => {
      socket.off("updateResponses");
    };
  }, [token]);

  // ===== 回答変更 =====
  const handleResponseChange = (date, value) => {
    setResponses((prev) => ({
      ...prev,
      [date]: value,
    }));
  };

  // ===== 保存処理 =====
  const handleSave = () => {
    const payload = {
      token,
      userId,
      username: username || "匿名",
      responses,
    };
    socket.emit("saveResponse", payload);
    setSaveMessage("✅ 保存しました！");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  return (
    <div className="share-page">
      <h2>日程共有ページ</h2>

      <div className="share-container">
        {/* ===== 日程リスト ===== */}
        <div className="glass-card">
          <h3>登録された日程</h3>
          {schedule ? (
            <ul className="schedule-list">
              {schedule.dates.map((d, idx) => (
                <li key={idx}>
                  {formatDate(d.date)}　({d.type})
                  {d.type === "時間指定" &&
                    ` ${d.startHour}:00～${d.endHour}:00`}
                </li>
              ))}
            </ul>
          ) : (
            <p>読み込み中...</p>
          )}
        </div>

        {/* ===== 回答フォーム ===== */}
        <div className="glass-card">
          <h3>あなたの出欠入力</h3>
          <input
            type="text"
            className="title-input"
            placeholder="お名前を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="response-form">
            {schedule &&
              schedule.dates.map((d, idx) => (
                <div className="response-row" key={idx}>
                  <span>{formatDate(d.date)}</span>
                  <select
                    className="response-select"
                    value={responses[d.date] || "-"}
                    onChange={(e) =>
                      handleResponseChange(d.date, e.target.value)
                    }
                  >
                    {attendanceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
          <button onClick={handleSave} className="save-btn">
            保存する
          </button>
          {saveMessage && <p>{saveMessage}</p>}
        </div>
      </div>

      {/* ===== 全員の回答 ===== */}
      <div className="glass-card" style={{ marginTop: "20px", width: "100%" }}>
        <h3>全員の回答一覧</h3>
        {allResponses.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="all-response-table">
              <thead>
                <tr>
                  <th>名前</th>
                  {schedule &&
                    schedule.dates.map((d, idx) => (
                      <th key={idx}>{formatDate(d.date)}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {allResponses.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.username}</td>
                    {schedule &&
                      schedule.dates.map((d, i) => (
                        <td key={i}>{r.responses[d.date] || "-"}</td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>まだ回答がありません。</p>
        )}
      </div>
    </div>
  );
};

export default SharePage;
