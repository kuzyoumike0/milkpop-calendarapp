import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharePage() {
  const { linkid } = useParams();
  const [data, setData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [username, setUsername] = useState("");
  const [selection, setSelection] = useState({});

  // === データ取得 ===
  useEffect(() => {
    axios.get(`/api/schedule/${linkid}`).then((res) => {
      setData(res.data);
      setResponses(res.data.responses || []);
    });
  }, [linkid]);

  // === 回答保存 ===
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    await axios.post(`/api/schedule/${linkid}/response`, {
      username,
      answers: selection, // backendはanswersを期待
    });
    const res = await axios.get(`/api/schedule/${linkid}`);
    setResponses(res.data.responses || []);
  };

  // === プルダウン用 ===
  const renderSelect = (scheduleId) => (
    <select
      className="p-1 rounded text-black"
      value={selection[scheduleId] || ""}
      onChange={(e) =>
        setSelection({ ...selection, [scheduleId]: e.target.value })
      }
    >
      <option value="">-</option>
      <option value="○">○</option>
      <option value="✖">✖</option>
    </select>
  );

  // === 回答マッピング ===
  const responseMap = {};
  responses.forEach((r) => {
    if (!responseMap[r.username]) responseMap[r.username] = {};
    const ans = r.answers || {};
    Object.keys(ans).forEach((k) => {
      responseMap[r.username][k] = ans[k];
    });
  });

  const users = Object.keys(responseMap);

  // === 出欠率計算 ===
  const calcStats = (scheduleId) => {
    const total = users.length;
    if (total === 0) return { rate: "-", count: "0/0" };
    const oks = users.filter((u) => responseMap[u][scheduleId] === "○").length;
    return {
      rate: `${Math.round((oks / total) * 100)}%`,
      count: `${oks}/${total}`,
    };
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">共有ページ</h2>

      <input
        className="p-2 mb-4 w-full text-black rounded"
        placeholder="名前を入力"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* 予定に対する回答入力 */}
      <h3 className="text-xl mt-6 mb-2 text-[#004CA0]">予定に対する回答</h3>
      <table className="w-full border text-center border-[#333]">
        <thead className="bg-[#004CA0] text-white">
          <tr>
            <th className="p-2">日付</th>
            <th className="p-2">時間帯</th>
            <th className="p-2">回答</th>
          </tr>
        </thead>
        <tbody>
          {(data?.schedules || []).map((s) => (
            <tr key={s.id} className="bg-[#111] border-b border-[#333]">
              <td className="p-2">{(s.dates || []).join(", ")}</td>
              <td className="p-2">{s.timeslot}</td>
              <td className="p-2">{renderSelect(s.id)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleSave} className="mt-4 btn-accent">
        保存
      </button>

      {/* ユーザーごとの〇✖一覧 */}
      <h3 className="text-xl mt-8 mb-2 text-[#004CA0]">全員分の一覧</h3>
      <div className="overflow-x-auto">
        <table className="w-full border text-center border-[#333]">
          <thead className="bg-[#004CA0] text-white">
            <tr>
              <th className="p-2">ユーザー</th>
              {(data?.schedules || []).map((s) => (
                <th key={s.id} className="p-2">
                  {(s.dates || []).join(", ")} <br /> {s.timeslot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u} className="bg-[#111] border-b border-[#333]">
                <td className="p-2 font-bold">{u}</td>
                {(data?.schedules || []).map((s) => (
                  <td
                    key={s.id}
                    className={`p-2 ${
                      responseMap[u][s.id] === "○"
                        ? "text-green-400"
                        : responseMap[u][s.id] === "✖"
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {responseMap[u][s.id] || "-"}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-[#222] text-yellow-400 font-bold">
              <td className="p-2">出欠率 / 人数</td>
              {(data?.schedules || []).map((s) => {
                const stats = calcStats(s.id);
                return (
                  <td key={s.id} className="p-2">
                    {stats.rate}
                    <br />
                    {stats.count}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
