import React, { useEffect, useState } from "react";

const SharePage = () => {
  const [schedules, setSchedules] = useState([]);
  const [votes, setVotes] = useState({});
  const [username, setUsername] = useState("");
  const [voteResults, setVoteResults] = useState({});

  // スケジュール取得
  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules");
      const data = await res.json();
      setSchedules(data);

      // スケジュールごとに投票結果取得
      data.forEach(async (s) => {
        const v = await fetchVotes(s.id);
        setVoteResults((prev) => ({ ...prev, [s.id]: v }));
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 投票結果取得
  const fetchVotes = async (scheduleId) => {
    try {
      const res = await fetch(`/api/votes/${scheduleId}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // 投票選択
  const handleVoteChange = (scheduleId, choice) => {
    setVotes((prev) => ({
      ...prev,
      [scheduleId]: choice,
    }));
  };

  // 投票保存
  const handleSaveVotes = async () => {
    try {
      for (const scheduleId in votes) {
        await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduleId,
            username: username || "匿名",
            choice: votes[scheduleId],
          }),
        });
      }
      alert("投票を保存しました！");
      fetchSchedules(); // 更新
    } catch (err) {
      console.error(err);
      alert("投票の保存に失敗しました");
    }
  };

  // 集計関数
  const countVotes = (voteList) => {
    const counts = { "〇": 0, "△": 0, "✖": 0 };
    voteList.forEach((v) => {
      if (counts[v.choice] !== undefined) counts[v.choice]++;
    });
    return counts;
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-b from-[#FDB9C8] via-white to-[#004CA0] min-h-screen">
      <header className="bg-black text-white text-center py-4 mb-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">MilkPOP Calendar</h1>
      </header>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-bold text-[#004CA0] mb-6">登録済み日程</h2>

        {/* ユーザー名入力 */}
        <div className="mb-6">
          <label className="block mb-2 text-[#004CA0] font-semibold">
            あなたの名前
          </label>
          <input
            type="text"
            className="w-full border rounded-xl px-4 py-2"
            placeholder="名前を入力してください（未入力なら匿名）"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <ul className="space-y-6">
          {schedules.map((s) => {
            const result = voteResults[s.id] || [];
            const counts = countVotes(result);

            return (
              <li
                key={s.id}
                className="border p-4 rounded-xl shadow-sm bg-gray-50"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-bold">{s.title}</p>
                    <p>{new Date(s.date).toLocaleDateString()}</p>
                  </div>
                  <select
                    className="border rounded-xl px-3 py-2"
                    value={votes[s.id] || ""}
                    onChange={(e) => handleVoteChange(s.id, e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="〇">〇</option>
                    <option value="△">△</option>
                    <option value="✖">✖</option>
                  </select>
                </div>

                {/* 投票結果 */}
                <div className="mt-2">
                  <h3 className="text-sm font-semibold text-[#004CA0] mb-1">
                    投票結果
                  </h3>
                  <ul className="text-sm space-y-1">
                    {result.length > 0 ? (
                      result.map((v, idx) => (
                        <li key={idx}>
                          {v.username} : {v.choice}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">まだ投票がありません</li>
                    )}
                  </ul>

                  {/* 集計表示 */}
                  <div className="mt-3 text-sm font-semibold">
                    集計：〇 {counts["〇"]}人 / △ {counts["△"]}人 / ✖{" "}
                    {counts["✖"]}人
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* 保存ボタン */}
        <button
          onClick={handleSaveVotes}
          className="mt-6 w-full bg-[#004CA0] text-white font-bold py-3 rounded-xl shadow hover:bg-[#FDB9C8] hover:text-black transition"
        >
          投票を保存する
        </button>
      </div>
    </div>
  );
};

export default SharePage;
