import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [votes, setVotes] = useState({});
  const [username, setUsername] = useState("");
  const [records, setRecords] = useState([]);

  // データ取得
  useEffect(() => {
    axios.get(`/api/schedule/${linkid}`).then((res) => {
      setSchedule(res.data.schedule);
      setRecords(res.data.records || []);
    });
  }, [linkid]);

  // 投票変更
  const handleVoteChange = (date, value) => {
    setVotes({ ...votes, [date]: value });
  };

  // 保存
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post(`/api/vote/${linkid}`, {
        username,
        votes,
      });
      const res = await axios.get(`/api/schedule/${linkid}`);
      setRecords(res.data.records || []);
      setVotes({});
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  if (!schedule) return <p className="text-white">読み込み中...</p>;

  // 日付一覧を生成
  const dates = [];
  const start = new Date(schedule.start_date);
  const end = new Date(schedule.end_date);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }

  return (
    <div className="max-w-5xl mx-auto bg-[#111] text-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-[#FDB9C8] mb-6">
        共有スケジュール
      </h2>

      {/* タイトル */}
      <div className="mb-4 text-center">
        <h3 className="text-xl font-semibold">{schedule.title}</h3>
        <p className="text-gray-400">({schedule.timeslot})</p>
      </div>

      {/* 名前入力 */}
      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="名前を入力"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 p-2 rounded bg-black border border-gray-600 focus:ring-2 focus:ring-[#FDB9C8]"
        />
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded bg-[#FDB9C8] text-black font-bold hover:bg-[#e79fb0] transition"
        >
          保存
        </button>
      </div>

      {/* 表形式 */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 text-center">
          <thead className="bg-[#222]">
            <tr>
              <th className="p-2 border border-gray-600">名前</th>
              {dates.map((d) => (
                <th key={d} className="p-2 border border-gray-600">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 既存の回答 */}
            {records.map((r, i) => (
              <tr key={i}>
                <td className="p-2 border border-gray-700">{r.username}</td>
                {dates.map((d) => (
                  <td key={d} className="p-2 border border-gray-700">
                    {r.votes[d] || "-"}
                  </td>
                ))}
              </tr>
            ))}
            {/* 入力中の行 */}
            <tr className="bg-[#1a1a1a]">
              <td className="p-2 border border-gray-700 font-semibold">
                {username || "あなた"}
              </td>
              {dates.map((d) => (
                <td key={d} className="p-2 border border-gray-700">
                  <select
                    value={votes[d] || ""}
                    onChange={(e) => handleVoteChange(d, e.target.value)}
                    className="p-1 rounded bg-black border border-gray-600"
                  >
                    <option value="">-</option>
                    <option value="〇">〇</option>
                    <option value="✖">✖</option>
                  </select>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
