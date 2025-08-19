import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [responses, setResponses] = useState({});
  const [username, setUsername] = useState("");
  const [myResponses, setMyResponses] = useState({});

  // データ取得
  useEffect(() => {
    axios.get(`/api/schedule/${linkid}`).then((res) => {
      setSchedule(res.data.schedule);
      setResponses(res.data.responses || {});
    });
  }, [linkid]);

  // 保存処理
  const handleSave = async () => {
    try {
      await axios.post(`/api/response/${linkid}`, {
        username,
        responses: myResponses,
      });
      const res = await axios.get(`/api/schedule/${linkid}`);
      setResponses(res.data.responses || {});
      setMyResponses({});
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  // 入力変更
  const handleChange = (key, value) => {
    setMyResponses({
      ...myResponses,
      [key]: value,
    });
  };

  if (!schedule) return <p className="text-center text-gray-400">読み込み中...</p>;

  // 日付の範囲を展開
  const getDatesInRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const dates = getDatesInRange(schedule.start_date, schedule.end_date);

  // 時間帯リスト（複数の場合に展開）
  const timeSlots = schedule.timeslot.includes(",")
    ? schedule.timeslot.split(",")
    : [schedule.timeslot];

  // 全行（date × timeslot の組み合わせ）
  const allRows = [];
  dates.forEach((date) => {
    timeSlots.forEach((slot) => {
      allRows.push({ date, slot });
    });
  });

  // ユーザー一覧
  const userList = Object.keys(responses);

  return (
    <div className="max-w-6xl mx-auto bg-[#111] text-white p-8 rounded-2xl shadow-lg">
      {/* タイトル */}
      <h2 className="text-3xl font-bold text-center text-[#FDB9C8] mb-6">
        {schedule.title}
      </h2>

      {/* 出欠表 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center bg-black rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#004CA0] text-white">
              <th className="p-3">日付</th>
              <th className="p-3">時間帯</th>
              {userList.map((user) => (
                <th key={user} className="p-3">{user}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRows.map(({ date, slot }) => (
              <tr key={`${date}-${slot}`} className="border-b border-gray-700 hover:bg-[#222]">
                <td className="p-3">{date}</td>
                <td className="p-3">{slot}</td>
                {userList.map((user) => (
                  <td key={user} className="p-3">
                    {responses[user]?.[`${date}-${slot}`] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 入力欄 */}
      <div className="mt-8 bg-[#222] p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4 text-[#FDB9C8] text-center">自分の出欠を入力</h3>
        <div className="mb-6 text-center">
          <input
            type="text"
            placeholder="名前を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 rounded-xl text-black w-64 text-center shadow"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center bg-black rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#004CA0] text-white">
                <th className="p-3">日付</th>
                <th className="p-3">時間帯</th>
                <th className="p-3">自分の出欠</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map(({ date, slot }) => (
                <tr key={`${date}-${slot}`} className="border-b border-gray-700 hover:bg-[#222]">
                  <td className="p-3">{date}</td>
                  <td className="p-3">{slot}</td>
                  <td className="p-3">
                    <select
                      value={myResponses[`${date}-${slot}`] || ""}
                      onChange={(e) => handleChange(`${date}-${slot}`, e.target.value)}
                      className="p-2 rounded-lg text-black"
                    >
                      <option value="">未選択</option>
                      <option value="◯">◯</option>
                      <option value="✖">✖</option>
                    </select>
                  </td>
                </tr>
              ))}
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
    </div>
  );
}
