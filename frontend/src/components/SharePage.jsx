// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../common.css";

const SharePage = () => {
  const { token } = useParams();
  const [title, setTitle] = useState("");
  const [schedules, setSchedules] = useState([]);

  // 初回ロード
  useEffect(() => {
    const data = localStorage.getItem(`schedule_${token}`);
    if (data) {
      const parsed = JSON.parse(data);

      // 既に保存済み（参加状況あり）ならそれを読み込む
      if (parsed.schedules && parsed.schedules.length > 0) {
        setTitle(parsed.title || "");
        setSchedules(parsed.schedules);
      }
    }
  }, [token]);

  // 入力変更
  const handleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  // 保存 → localStorageに反映
  const saveSchedule = (index) => {
    const updated = [...schedules];
    setSchedules(updated);

    const stored = JSON.parse(localStorage.getItem(`schedule_${token}`)) || {};
    stored.schedules = updated;
    localStorage.setItem(`schedule_${token}`, JSON.stringify(stored));

    alert(
      `${schedules[index].date} ${schedules[index].time} | ${schedules[index].name || "未入力"} さん → ${schedules[index].status} を保存しました`
    );
  };

  // 削除 → localStorageからも更新
  const deleteSchedule = (index) => {
    if (window.confirm("このスケジュールを削除しますか？")) {
      const updated = schedules.filter((_, i) => i !== index);
      setSchedules(updated);

      const stored = JSON.parse(localStorage.getItem(`schedule_${token}`)) || {};
      stored.schedules = updated;
      localStorage.setItem(`schedule_${token}`, JSON.stringify(stored));
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">共有スケジュール</h2>
      {title && <h3>{title}</h3>}

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
                  value={s.name || ""}
                  onChange={(e) => handleChange(i, "name", e.target.value)}
                  placeholder="名前"
                />
              </td>
              <td>
                <select
                  className="share-dropdown"
                  value={s.status || "〇"}
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
