import React, { useEffect, useState } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

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
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("投票の保存に失敗しました");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <>
      <Header />
      <main className="share-page">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="form-title">共有された日程</h2>

          {/* ユーザー名入力（統一スタイル） */}
          <div className="mb-6 text-left">
            <label className="block mb-2 text-[#004CA0] font-semibold">
              🙋 あなたの名前
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="名前を入力してください（未入力なら匿名）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* スケジュール表示（省略、前回のコードと同じ） */}
          {/* ... */}

          {/* 保存ボタン */}
          <button
            onClick={handleSaveVotes}
            className="vote-save-btn mt-6"
          >
            投票を保存する
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SharePage;
