// frontend/src/components/SharePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

const SharePage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [schedule, setSchedule] = useState(null);
  const [votes, setVotes] = useState({});
  const [username, setUsername] = useState("");
  const [allVotes, setAllVotes] = useState([]);

  // ✅ OAuthからusernameを受け取る
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const discordName = params.get("username");
    if (discordName) {
      setUsername(discordName);
    }
  }, [location]);

  // 初期ロード
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/share/${id}`);
      setSchedule(res.data);

      const voteRes = await axios.get(`/api/share/${id}/votes`);
      setAllVotes(voteRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 投票変更
  const handleVoteChange = (date, value) => {
    setVotes({ ...votes, [date]: value });
  };

  // 投票保存
  const handleSave = async () => {
    if (!username) {
      alert("名前を入力してください");
      return;
    }
    try {
      await axios.post(`/api/share/${id}/vote`, { username, votes });
      fetchData(); // 即更新
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました");
    }
  };

  if (!schedule) return <p>読み込み中...</p>;

  return (
    <main className="container mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-center mb-6 text-[#004CA0]">
        {schedule.schedules[0].title}
      </h2>

      {/* 名前入力（Discordログイン済みなら表示しない） */}
      {!username && (
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <label className="block font-semibold mb-2">名前</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="あなたの名前を入力"
          />
          <a
            href="/auth/discord"
            className="discord-btn inline-block mt-3"
          >
            Discordでログイン
          </a>
        </div>
      )}

      {/* 投票入力 */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">日程に対する回答</h3>
        <ul className="space-y-3">
          {schedule.schedules[0].dates.map((date) => (
            <li key={date} className="flex justify-between items-center">
              <span className="font-semibold">{date}</span>
              <select
                onChange={(e) => handleVoteChange(date, e.target.value)}
                className="border rounded-lg px-2 py-1"
              >
                <option value="">未選択</option>
                <option value="◯">◯ 参加可能</option>
                <option value="✖">✖ 不可</option>
                <option value="△">△ 微妙</option>
              </select>
            </li>
          ))}
        </ul>
        <button
          onClick={handleSave}
          className="btn btn-pink px-6 py-2 mt-6"
        >
          保存
        </button>
      </div>

      {/* 投票結果一覧 */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">回答一覧</h3>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border px-3 py-2">名前</th>
              {schedule.schedules[0].dates.map((date) => (
                <th key={date} className="border px-3 py-2">{date}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allVotes.map((row, i) => (
              <tr key={i}>
                <td className="border px-3 py-2">{row.username}</td>
                {schedule.schedules[0].dates.map((date) => (
                  <td key={date} className="border px-3 py-2 text-center">
                    {row.votes[date] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default SharePage;
