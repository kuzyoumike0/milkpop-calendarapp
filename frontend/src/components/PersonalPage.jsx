import React, { useState } from "react";
import "../index.css";
import Header from "./Header";
import Footer from "./Footer";

const PersonalPage = () => {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  const handleSave = async () => {
    try {
      const res = await fetch("/api/personal-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          memo,
          date: new Date(),
          selectionMode: "single",
          timeType: "終日",
          startTime: null,
          endTime: null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert("✅ 個人スケジュールを保存しました");
      }
    } catch (err) {
      console.error(err);
      alert("❌ 保存に失敗しました");
    }
  };

  return (
    <>
      <Header />
      <main className="register-page">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-[#004CA0] mb-6">
            📝 個人スケジュール登録
          </h2>

          {/* タイトル入力 */}
          <div className="mb-6 text-left">
            <label className="block text-[#004CA0] font-bold mb-2 text-lg">
              📌 タイトル
            </label>
            <input
              type="text"
              placeholder="例: 出張予定"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value.replace(/_/g, ""))}
            />
          </div>

          {/* メモ入力 */}
          <div className="mb-6 text-left">
            <label className="block text-[#004CA0] font-bold mb-2 text-lg">
              🗒 メモ
            </label>
            <textarea
              placeholder="詳細を入力してください"
              className="input-field"
              rows="4"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {/* 保存ボタン */}
          <button onClick={handleSave} className="save-btn">
            💾 保存する
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PersonalPage;
