import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ShareLinkPage() {
  const { linkid } = useParams();
  const [schedules, setSchedules] = useState([]);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [selectedResponses, setSelectedResponses] = useState({});

  // === スケジュール取得 ===
  useEffect(() => {
    axios.get(`/api/share/${linkid}`)
      .then((res) => setSchedules(res.data))
      .catch((err) => console.error("共有日程取得エラー:", err));

    fetchResponses();
  }, [linkid]);

  // === 登録済み応答取得 ===
  const fetchResponses = async () => {
    try {
      const res = await axios.get(`/api/responses?linkid=${linkid}`);
      setResponses(res.data);
    } catch (err) {
      console.error("応答取得エラー:", err);
    }
  };

  // === 変更イベント ===
  const handleChange = (scheduleId, value) => {
    setSelectedResponses((prev) => ({
      ...prev,
      [scheduleId]: value,
    }));
  };

  // === 保存 ===
  const handleSave = async () => {
    try {
      const promises = Object.entries(selectedResponses).map(
        ([scheduleId, response]) =>
          axios.post("/api/response", {
            username,
            schedule_id: scheduleId,
            response,
          })
      );
      await Promise.all(promises);

      // 即時反映
      fetchResponses();
      alert("保存しました！");
    } catch (err) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="p-6 bg-[#FDB9C8] min-h-screen text-white">
      <h1 className="text-3xl font-bold text-center mb-6">
        共有スケジュール
      </h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="あなたの名前"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded text-black w-full"
        />
      </div>

      <table className="w-full bg-black/40 rounded-lg shadow-lg">
        <thead>
          <tr>
            <th className="p-2">タイトル</th>
            <th className="p-2">日付</th>
            <th className="p-2">時間帯</th>
            <th className="p-2">あなたの回答</th>
            <th className="p-2">参加者の回答</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((sch) => (
            <tr key={sch.id} className="text-center">
              <td className="p-2">{sch.title}</td>
              <td className="p-2">
                {sch.start_date} ~ {sch.end_date}
              </td>
              <td className="p-2">{sch.timeslot}</td>
              <td className="p-2">
                <select
                  className="text-black p-1 rounded"
                  value={selectedResponses[sch.id] || ""}
                  onChange={(e) => handleChange(sch.id, e.target.value)}
                >
                  <option value="">選択</option>
                  <option value="〇">〇</option>
                  <option value="✖">✖</option>
                </select>
              </td>
              <td className="p-2">
                {responses
                  .filter((r) => r.schedule_id === sch.id)
                  .map((r, idx) => (
                    <div key={idx}>
                      {r.username}: {r.response}
                    </div>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-center mt-6">
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg bg-[#004CA0] hover:bg-blue-900 transition"
        >
          保存する
        </button>
      </div>
    </div>
  );
}
