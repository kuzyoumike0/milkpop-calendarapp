// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../common.css";

const SharePage = () => {
  const { token } = useParams();
  const [title, setTitle] = useState("");
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/share/${token}`);
      const data = await res.json();

      setTitle(data.title);

      // 🔹 日付+時間帯ごとにグループ化
      const groupedData = {};
      data.schedules.forEach((s) => {
        const key = `${s.date} (${s.time})`;
        if (!groupedData[key]) groupedData[key] = [];
        groupedData[key].push(s);
      });
      setGrouped(groupedData);
    };
    fetchData();
  }, [token]);

  const saveAttendance = async (date, time, name, status) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/share/${token}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time, name, status }),
    });
    alert(`${date} (${time}) | ${name} さん → ${status} を保存しました`);
    window.location.reload(); // 再読み込みで即反映
  };

  return (
    <div className="page-container">
      <h2 className="page-title">共有スケジュール</h2>
      {title && <h3>{title}</h3>}

      {Object.keys(grouped).map((key) => (
        <div key={key} className="schedule-block">
          <h4>{key}</h4>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>名前</th>
                <th>参加状況</th>
              </tr>
            </thead>
            <tbody>
              {grouped[key].map((s, i) => (
                <tr key={i}>
                  <td>{s.name || "（未入力）"}</td>
                  <td>{s.status}</td>
                </tr>
              ))}
              {/* 入力欄 */}
              <tr>
                <td>
                  <input type="text" id={`name-${key}`} placeholder="名前" />
                </td>
                <td>
                  <select id={`status-${key}`} defaultValue="〇">
                    <option value="〇">〇</option>
                    <option value="△">△</option>
                    <option value="✖">✖</option>
                  </select>
                  <button
                    onClick={() =>
                      saveAttendance(
                        key.split(" ")[0], // date
                        key.match(/\((.*?)\)/)[1], // time
                        document.getElementById(`name-${key}`).value,
                        document.getElementById(`status-${key}`).value
                      )
                    }
                  >
                    保存
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default SharePage;
