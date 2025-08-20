import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [data, setData] = useState({ schedules: [], responses: [] });
  const [username, setUsername] = useState("");
  const [responses, setResponses] = useState({});

  const fetchSharedData = async () => {
    const res = await axios.get(`/api/shared/${linkid}`);
    setData(res.data);
  };

  useEffect(() => {
    fetchSharedData();
  }, [linkid]);

  const handleSelect = (scheduleId, value) => {
    setResponses({ ...responses, [scheduleId]: value });
  };

  const handleSave = async () => {
    const payload = Object.keys(responses).map((sid) => ({
      schedule_id: sid,
      username,
      response: responses[sid],
    }));
    await axios.post("/api/shared", { responses: payload });
    fetchSharedData();
  };

  // === ユーザー別一覧作成 ===
  const users = [...new Set(data.responses.map((r) => r.username))];
  const responseMap = {};
  data.responses.forEach((r) => {
    if (!responseMap[r.username]) responseMap[r.username] = {};
    responseMap[r.username][r.schedule_id] = r.response;
  });

  // === セル色付け ===
  const renderCell = (value) => {
    if (value === "〇") return <span className="text-green-500 font-bold">〇</span>;
    if (value === "✖") return <span className="text-red-500 font-bold">✖</span>;
    return "-";
  };

  // === 出欠率 ===
  const calcRate = (scheduleId) => {
    const res = data.responses.filter((r) => r.schedule_id == scheduleId);
    if (res.length === 0) return "-";
    const okCount = res.filter((r) => r.response === "〇").length;
    const rate = Math.round((okCount / res.length) * 100);
    return `${rate}%`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">共有ページ</h2>
      <input
        className="p-2 mb-4 w-full text-black rounded"
        placeholder="名前を入力"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* 予定に対する回答入力 */}
      <h3 className="text-xl mt-6 mb-2">予定に対する回答</h3>
      <table className="w-full border text-center">
        <thead className="bg-[#004CA0] text-white">
          <tr>
            <th>日付</th>
            <th>タイトル</th>
            <th>時間帯</th>
            <th>選択</th>
          </tr>
        </thead>
        <tbody>
          {data.schedules.map((s) => (
            <tr key={s.id}>
              <td>{s.date}</td>
              <td>{s.title}</td>
              <td>{s.timeslot}</td>
              <td>
                <select
                  className="text-black p-1 rounded"
                  onChange={(e) => handleSelect(s.id, e.target.value)}
                >
                  <option value="">選択</option>
                  <option value="〇">〇</option>
                  <option value="✖">✖</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        className="mt-4 bg-[#FDB9C8] text-black px-4 py-2 rounded-xl"
      >
        保存
      </button>

      {/* ユーザーごとの〇✖一覧 */}
      <h3 className="text-xl mt-8 mb-2">全員分の一覧</h3>
      <div className="overflow-x-auto">
        <table className="w-full border text-center">
          <thead className="bg-[#004CA0] text-white">
            <tr>
              <th className="p-2">ユーザー</th>
              {data.schedules.map((s) => (
                <th key={s.id} className="p-2">
                  {s.date} <br /> {s.timeslot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u} className="border-t">
                <td className="font-bold p-2 bg-[#111]">{u}</td>
                {data.schedules.map((s) => (
                  <td key={s.id} className="p-2">
                    {renderCell(
                      responseMap[u] && responseMap[u][s.id]
                        ? responseMap[u][s.id]
                        : "-"
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* 出欠率行 */}
            <tr className="border-t bg-[#222] text-yellow-400 font-bold">
              <td>出欠率</td>
              {data.schedules.map((s) => (
                <td key={s.id}>{calcRate(s.id)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
