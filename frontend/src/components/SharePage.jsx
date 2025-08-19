import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkId } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});
  const [name, setName] = useState("");

  useEffect(() => {
    axios.get(`/api/share/${linkId}`).then((res) => {
      setSchedules(res.data.schedules || []);
    });
  }, [linkId]);

  const handleChange = (date, value) => {
    setResponses((prev) => ({ ...prev, [date]: value }));
  };

  const handleSave = async () => {
    if (!name) {
      alert("名前を入力してください");
      return;
    }
    await axios.post(`/api/share/${linkId}/save`, {
      name,
      responses,
    });
    const res = await axios.get(`/api/share/${linkId}`);
    setSchedules(res.data.schedules || []);
  };

  return (
    <div>
      <h2>👥 日程共有ページ</h2>

      <div>
        <label>名前: </label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <table border="1" cellPadding="5" style={{ marginTop: "15px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>時間帯</th>
            <th>出欠</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((sch, i) => (
            <tr key={i}>
              <td>{sch.date}</td>
              <td>{sch.timeSlot}</td>
              <td>
                <select
                  value={responses[sch.date] || ""}
                  onChange={(e) => handleChange(sch.date, e.target.value)}
                >
                  <option value="">選択してください</option>
                  <option value="〇">〇</option>
                  <option value="✖">✖</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={{ marginTop: "15px" }} onClick={handleSave}>
        保存
      </button>
    </div>
  );
}
