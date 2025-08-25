// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../share.css";   // ✅ SharePage専用CSSを適用

const SharePage = () => {
  const { token } = useParams();
  const [title, setTitle] = useState("");
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem(`schedule_${token}`);
    if (data) {
      const parsed = JSON.parse(data);
      setTitle(parsed.title || "");
      setSchedules(
        parsed.schedules.map((s) => ({
          ...s,
          name: "",
          status: "〇",
        }))
      );
    }
  }, [token]);

  const handleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const saveSchedule = (index) => {
    alert(
      `${schedules[index].date} ${schedules[index].time} | ${schedules[index].name} さん → ${schedules[index].status} を保存しました`
    );
  };

  const deleteSchedule = (index) => {
    if (window.confirm("このスケジュールを削除しますか？")) {
      const updated = schedules.filter((_, i) => i !== index);
      setSchedules(updated);
    }
  };

  return (
    <div className="share-page">
      <h2 className="page-title">共有スケジュール</h2>
      {title && <h3 className="share-title">{title}</h3>}

      <table className="attendance-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>時間帯</th>
            <th>名前</th>
            <th>参加状況</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, i) => (
            <tr key={i}>
              <td>{s.date}</td>
              <td>{s.time}</td>
              <td>
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => handleChange(i, "name", e.target.value)}
                  placeholder="名前"
                  className="name-input"
                />
              </td>
              <td>
                <select
                  className="share-dropdown"
                  value={s.status}
                  onChange={(e) => handleChange(i, "status", e.target.value)}
                >
                  <option value="〇">〇</option>
                  <option value="△">△</option>
                  <option value="✖">✖</option>
                </select>
              </td>
              <td>
                <button
                  className="action-button save"
                  onClick={() => saveSchedule(i)}
                >
                  保存
                </button>
                <button
                  className="action-button delete"
                  onClick={() => deleteSchedule(i)}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SharePage;
