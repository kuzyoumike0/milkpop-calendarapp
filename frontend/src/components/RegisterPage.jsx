import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const SharePage = () => {
  const { shareId } = useParams(); // = share_token
  const [linkInfo, setLinkInfo] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [votes, setVotes] = useState({});
  const [voteResults, setVoteResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== 共有スケジュール取得 =====
  const fetchLinkInfo = async () => {
    try {
      const res = await fetch(`/share/${shareId}`);
      const json = await res.json();
      if (!json.error) {
        setLinkInfo(json);
        // 投票結果を取得
        fetchVoteResults(json.id);
      }
    } catch (err) {
      console.error("共有取得エラー:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== 投票結果取得 =====
  const fetchVoteResults = async (scheduleId) => {
    try {
      const res = await fetch(`/api/schedule_responses/${scheduleId}`);
      const json = await res.json();
      if (json.success) {
        setVoteResults(json.data); // [{ username, responses }, ...]
      }
    } catch (err) {
      console.error("投票結果取得エラー:", err);
    }
  };

  // ===== 投票選択 =====
  const handleVoteChange = (dateStr, choice) => {
    setVotes((prev) => ({ ...prev, [dateStr]: choice }));
  };

  // ===== 投票保存 =====
  const handleSaveVotes = async () => {
    try {
      localStorage.setItem("username", username || "匿名");
      const res = await fetch("/api/schedule_responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: linkInfo.id,
          username: username || "匿名",
          responses: votes,
        }),
      });
      const json = await res.json();
      if (json.error) {
        alert("❌ 保存に失敗しました: " + json.error);
      } else {
        alert("✅ 投票を保存しました！");
        fetchVoteResults(linkInfo.id); // 最新結果を再取得
      }
    } catch (err) {
      console.error(err);
      alert("❌ 保存に失敗しました");
    }
  };

  // ===== 集計処理 =====
  const countVotes = (dateStr) => {
    const counts = { "〇": 0, "△": 0, "✖": 0 };
    voteResults.forEach((v) => {
      const choice = v.responses[dateStr];
      if (counts[choice] !== undefined) counts[choice]++;
    });
    return counts;
  };

  useEffect(() => {
    fetchLinkInfo();
  }, [shareId]);

  return (
    <>
      <Header />
      <main className="share-page">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {loading ? (
            <p className="text-center text-gray-600">読み込み中...</p>
          ) : !linkInfo ? (
            <p className="text-center text-red-500">❌ この共有リンクは存在しません</p>
          ) : (
            <>
              {/* タイトル */}
              <h2 className="text-2xl font-bold text-center text-[#004CA0] mb-6">
                📎 {linkInfo.title}
              </h2>

              {/* 名前入力 */}
              <div className="mb-6">
                <label className="block mb-2 text-[#004CA0] font-semibold">
                  あなたの名前
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-[#FDB9C8] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#004CA0]"
                  placeholder="名前を入力してください（未入力なら匿名）"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* 日程リスト */}
              <ul className="space-y-6">
                {linkInfo?.dates?.map((d) => {
                  const counts = countVotes(d);

                  return (
                    <li key={d} className="card">
                      <div className="flex justify-between items-center mb-4 w-full">
                        <div>
                          <p className="schedule-title">{d}</p>
                          <p className="date-tag">{linkInfo.options?.[d]?.type || "終日"}</p>
                        </div>
                        <select
                          className="vote-select"
                          value={votes[d] || ""}
                          onChange={(e) => handleVoteChange(d, e.target.value)}
                        >
                          <option value="">選択してください</option>
                          <option value="〇">〇</option>
                          <option value="△">△</option>
                          <option value="✖">✖</option>
                        </select>
                      </div>

                      {/* 投票結果一覧 */}
                      <div className="vote-results">
                        {voteResults.length > 0 ? (
                          <ul className="text-sm space-y-1">
                            {voteResults.map((v, idx) =>
                              v.responses[d] ? (
                                <li key={idx} className="flex justify-between">
                                  <span>{v.username}</span>
                                  <span>{v.responses[d]}</span>
                                </li>
                              ) : null
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500">まだ投票がありません</p>
                        )}
                        <div className="mt-2 text-sm font-semibold">
                          集計：〇 {counts["〇"]}人 / △ {counts["△"]}人 / ✖ {counts["✖"]}人
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* 保存ボタン */}
              <button onClick={handleSaveVotes} className="vote-save-btn mt-6">
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
