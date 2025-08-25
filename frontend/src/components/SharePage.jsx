import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [schedules, setSchedules] = useState([]);

  // ダミーデータ（バックエンド未接続用）
  useEffect(() => {
    setSchedules([
      { date: "2025-08-24", name: "Aさん", status: "〇" },
      { date: "2025-08-25", name: "Bさん", status: "✖" },
      { date: "2025-08-26", name: "Cさん", status: "△" },
    ]);
  }, [token]);

  // ステータス変更
  const handleChange = (index, value) => {
    const updated = [...schedules];
    updated[index].status = value;
    setSchedules(updated);
  };

  // 保存（DB接続するならここでAPI呼び出し）
  const saveSchedule = (index) => {
    alert(`${schedules[index].name} さんの参加状況を保存しました！`);
  };

  // 削除
  const deleteSchedule = (index) => {
    if (window.confirm("このスケジュールを削除しますか？")) {
      const updated = schedules.filter((_, i) => i !== index);
      setSchedules(updated);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">共有スケジュール</h2>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>名前</th>
            <th>参加状況</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s, i) => (
            <tr key={i}>
              <td>{s.date}</td>
              <td>{s.name}</td>
              <td>
                <select
                  className="share-dropdown"
                  value={s.status}
                  onChange={(e) => handleChange(i, e.target.value)}
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
