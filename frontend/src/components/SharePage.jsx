import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const SharePage = () => {
  const { shareId } = useParams(); // URLからid取得
  const [linkInfo, setLinkInfo] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [votes, setVotes] = useState({});
  const [username, setUsername] = useState("");
  const [voteResults, setVoteResults] = useState({});
  const [loading, setLoading] = useState(true);

  // 共有リンク情報を取得
  const fetchLinkInfo = async () => {
    try {
      const res = await fetch(`/api/share-links/${shareId}`);
      const json = await res.json();
      if (json.success) {
        setLinkInfo(json.data);
      } else {
        setLinkInfo(null);
      }
    } catch (err) {
      console.error(err);
      setLinkInfo(null);
    }
  };

  // スケジュール取得
  const fetchSchedules = async () => {
    try {
      const res = await fetch(`/api/share-links/${shareId}/schedules`);
      const json = await res.json();
      if (json.success) {
        setSchedules(json.data);

        // スケジュールごとに投票結果取得
        json.data.forEach(async (s) => {
          const v = await fetchVotes(s.id);
          setVoteResults((prev) => ({ ...prev, [s.id]: v }));
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 投票結果取得
  const fetchVotes = async (scheduleId) => {
    try {
      const res = await fetch(`/api/votes/${scheduleId}`);
      const json = await res.json();
      return json.success ? json.data : [];
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
      alert("✅ 投票を保存しました！");
      fetchSchedules(); // 更新
    } catch (err) {
      console.error(err);
      alert("❌ 投票の保存に失敗しました");
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
    fetchLinkInfo();
    fetchSchedules();
  }, [shareId]);

  return (
    <>
      <Header />
      <main className="share-page">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {loading ? (
            <p className="text-center text-gray-600">読み込み中...</p>
          ) : !linkInfo ? (
            <p className="text-center text-red-500">
              ❌ この共有リンクは存在しません
            </p>
          ) : (
            <>
              {/* タイトル */}
              <h2 className="text-2xl font-bold text-center text-[#004CA0] mb-8">
                📎 {linkInfo.title}
              </h2>

              {/* ユーザー名入力 */}
              <div className="mb-6">
                <label className="block mb-2 text-[#004CA0] font-semibold">
                  あなたの名前
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-[#FDB9C8] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004CA0] transition"
                  placeholder="名前を入力してください（未入力なら匿名）"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* 日程リスト */}
              <ul className="space-y-6">
                {schedules.map((s) => {
                  const result = voteResults[s.id] || [];
                  const counts = countVotes(result);

                  return (
                    <li key={s.id} className="card">
                      <div className="flex justify-between items-center mb-4 w-full">
                        <div>
                          <p className="schedule-title">{s.title}</p>
                          <p className="date-tag">
                            {new Date(s.date).toLocaleDateString()}
                          </p>
                        </div>
                        <select
                          className="vote-select"
                          value={votes[s.id] || ""}
                          onChange={(e) =>
                            handleVoteChange(s.id, e.target.value)
                          }
                        >
                          <option value="">選択してください</option>
                          <option value="〇">〇</option>
                          <option value="△">△</option>
                          <option value="✖">✖</option>
                        </select>
                      </div>

                      {/* 投票結果 */}
                      <div className="vote-results">
                        <h3 className="text-sm font-semibold text-[#004CA0] mb-1">
                          投票結果
                        </h3>
                        {result.length > 0 ? (
                          <ul className="text-sm space-y-1">
                            {result.map((v, idx) => (
                              <li key={idx} className="flex justify-between">
                                <span>{v.username}</span>
                                <span>{v.choice}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">まだ投票がありません</p>
                        )}

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
                className="vote-save-btn mt-6"
              >
                💾 投票を保存する
              </button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SharePage;
