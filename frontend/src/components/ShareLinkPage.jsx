import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io();

export default function ShareLinkPage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState({});

  // スケジュール取得
  const fetchSchedules = async () => {
    try {
      const res = await fetch(`/api/share/${linkid}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // 日付ソート
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setSchedules(data);
      }
    } catch (err) {
      console.error("取得エラー:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    socket.on("update", fetchSchedules);
    return () => socket.off("update", fetchSchedules);
  }, [linkid]);

  // 入力変更
  const handleChange = (scheduleId, field, value) => {
    setResponses((prev) => ({
      ...prev,
      [scheduleId]: {
        ...prev[scheduleId],
        [field]: value,
      },
    }));
  };

  // 登録処理
  const handleSubmit = async (scheduleId) => {
    const entry = responses[scheduleId];
    if (!entry?.name || !entry?.status) {
      alert("名前と出欠を入力してください");
      return;
    }

    try {
      await fetch(`/api/share/${linkid}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId,
          name: entry.name,
          status: entry.status,
        }),
      });
      setResponses((prev) => ({
        ...prev,
        [scheduleId]: { name: "", status: "" },
      }));
    } catch (err) {
      console.error("登録エラー:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>共有スケジュール回答ページ</h2>
      <p>リンクID: {linkid}</p>

      {schedules.length === 0 ? (
        <p>登録された日程がありません。</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>日付</th>
              <th>タイトル</th>
              <th>時間帯</th>
              <th>名前</th>
              <th>出欠</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td>{s.date}</td>
                <td>{s.title}</td>
                <td>
                  {s.timemode === "custom"
                    ? `${s.starthour}時〜${s.endhour}時`
                    : s.timemode}
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="名前"
                    value={responses[s.id]?.name || ""}
                    onChange={(e) => handleChange(s.id, "name", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={responses[s.id]?.status || ""}
                    onChange={(e) => handleChange(s.id, "status", e.target.value)}
                  >
                    <option value="">選択</option>
                    <option value="〇">〇</option>
                    <option value="✖">✖</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleSubmit(s.id)}>登録</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
