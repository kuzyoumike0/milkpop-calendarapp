// frontend/src/components/SharePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";

const SharePage = () => {
  const { token } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [responses, setResponses] = useState({});
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch(`/api/schedules/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert("共有リンクが無効です");
        } else {
          data.dates.sort();
          setScheduleData(data);
        }
      });
  }, [token]);

  const handleSelect = (date, value) => {
    setResponses((prev) => ({ ...prev, [date]: value }));
  };

  const handleSave = async () => {
    if (!userName) {
      alert("名前を入力してください");
      return;
    }
    await fetch(`/api/schedules/${token}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: userName, responses }),
    });
    const updated = await fetch(`/api/schedules/${token}`).then((r) =>
      r.json()
    );
    setScheduleData(updated);
  };

  if (!scheduleData) return <p>読み込み中...</p>;

  return (
    <div className="page-container">
      <h2 className="page-title">📢 共有ページ</h2>
      <h3>タイトル: {scheduleData.title}</h3>
      <input
        type="text"
        placeholder="名前を入力"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="title-input"
      />

      {scheduleData.dates.map((d) => (
        <div key={d} className="schedule-item">
          <span>{d}</span>
          <select
            value={responses[d] || ""}
            onChange={(e) => handleSelect(d, e.target.value)}
            className="custom-dropdown"
          >
            <option value="">選択</option>
            <option value="〇">〇</option>
            <option value="✕">✕</option>
          </select>
        </div>
      ))}

      <button onClick={handleSave} className="share-button fancy">
        保存
      </button>

      {scheduleData.responses && (
        <table className="responses-table">
          <thead>
            <tr>
              <th>名前</th>
              {scheduleData.dates.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(scheduleData.responses).map(([name, res]) => (
              <tr key={name}>
                <td>{name}</td>
                {scheduleData.dates.map((d) => (
                  <td key={d}>{res[d] || "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SharePage;
