import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  const [title, setTitle] = useState("");
  const [dates, setDates] = useState([]);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");

  // 初期ロード
  useEffect(() => {
    axios
      .get(`/api/schedules/${linkId}`)
      .then((res) => {
        setTitle(res.data.title);
        setDates(res.data.dates);
        setResponses(res.data.responses || {});
      })
      .catch((err) => console.error("取得失敗:", err));
  }, [linkId]);

  // 保存処理
  const handleSave = async (date, status) => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post("/api/response", {
        linkId,
        username,
        date,
        status,
      });

      // フロント側を即時更新
      setResponses((prev) => {
        const copy = { ...prev };
        if (!copy[date]) copy[date] = {};
        copy[date][username] = status;
        return copy;
      });
    } catch (err) {
      console.error("保存失敗:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール</h2>
      <h3>📌 {title}</h3>

      <div>
        <label>名前: </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="名前を入力"
        />
      </div>

      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>参加者ごとの回答</th>
            <th>自分の回答</th>
          </tr>
        </thead>
        <tbody>
          {dates.map((d, idx) => (
            <tr key={idx}>
              <td>{d}</td>
              <td>
                {responses[d]
                  ? Object.entries(responses[d]).map(([user, status], i) => (
                      <div key={i}>
                        {user}: {status}
                      </div>
                    ))
                  : "未回答"}
              </td>
              <td>
                <select
                  onChange={(e) => handleSave(d, e.target.value)}
                  value={(responses[d] && responses[d][username]) || ""}
                >
                  <option value="">選択</option>
                  <option value="◯">◯</option>
                  <option value="✕">✕</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
