import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");
  const [allResponses, setAllResponses] = useState([]); // 全ユーザーの回答

  // スケジュール取得
  useEffect(() => {
    axios.get(`/api/schedule/${linkid}`).then((res) => {
      setSchedule(res.data);
    });
    fetchResponses();
  }, [linkid]);

  const fetchResponses = async () => {
    const res = await axios.get(`/api/share/${linkid}`);
    setAllResponses(res.data); // [{ username, responses }]
  };

  if (!schedule) return <div className="text-center mt-10">読み込み中...</div>;

  const dates = [];
  let current = new Date(schedule.start_date);
  const end = new Date(schedule.end_date);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const timeslots = schedule.timeslot ? schedule.timeslot.split(",") : [];

  // 自分の選択を変更
  const handleSelect = (date, slot, value) => {
    setResponses({
      ...responses,
      [`${date}_${slot}`]: value,
    });
  };

  // 保存
  const handleSave = async () => {
    try {
      await axios.post(`/api/share/${linkid}`, {
        username,
        responses,
      });
      await fetchResponses(); // 最新データを取得して即反映
      alert("保存しました！");
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-[#111] text-white p-8 rounded-2xl shadow-lg">
      {/* タイトル */}
      <h2 className="text-3xl font-bold mb-6 text-center text-[#FDB9C8]">
        {schedule.title}
      </h2>

      {/* 名前入力 */}
      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 rounded-xl text-black w-1/2"
        />
      </div>

      {/* 出欠表 */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-700 w-full text-sm">
          <thead>
            <tr className="bg-[#004CA0] text-white">
              <th className="border border-gray-700 p-2">日付</th>
              <th className="border border-gray-700 p-2">時間帯</th>
              {allResponses.map((r) => (
                <th key={r.username} className="border border-gray-700 p-2">
                  {r.username}
                </th>
              ))}
              <th className="border border-gray-700 p-2">自分の入力</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => {
              const dStr = date.toISOString().slice(0, 10);
              return timeslots.map((slot) => (
                <tr key={`${dStr}_${slot}`}>
                  <td className="border border-gray-700 p-2 text-center">
                    {dStr}
                  </td>
                  <td className="border border-gray-700 p-2 text-center">
                    {slot}
                  </td>
                  {allResponses.map((r) => (
                    <td
                      key={`${r.username}_${dStr}_${slot}`}
                      className="border border-gray-700 p-2 text-center"
                    >
                      {r.responses[`${dStr}_${slot}`] || "-"}
                    </td>
                  ))}
                  <td className="border border-gray-700 p-2 text-center">
                    <select
                      value={responses[`${dStr}_${slot}`] || ""}
                      onChange={(e) =>
                        handleSelect(dStr, slot, e.target.value)
                      }
                      className="p-2 rounded text-black"
                    >
                      <option value="">-</option>
                      <option value="〇">〇</option>
                      <option value="✖">✖</option>
                    </select>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      {/* 保存ボタン */}
      <div className="text-center mt-6">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-[#FDB9C8] to-[#004CA0] rounded-xl font-bold hover:scale-105 transform transition"
        >
          保存
        </button>
      </div>
    </div>
  );
}
