import React, { useState } from "react";
import { useHistory } from "react-router-dom";

export default function TopPage() {
  const history = useHistory();
  const [shareId, setShareId] = useState("");

  const handleGoLink = () => {
    if (!shareId) {
      alert("共有リンクIDを入力してください");
      return;
    }
    history.push(`/share/${shareId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* バナー */}
      <header className="text-center text-4xl font-extrabold mb-10 text-[#FDB9C8]">
        MilkPOP Calendar
      </header>

      {/* メインコンテンツ */}
      <div className="flex flex-col items-center space-y-6">
        <button
          onClick={() => history.push("/link")}
          className="w-72 p-4 rounded-2xl bg-[#004CA0] text-white font-bold shadow-lg hover:opacity-80"
        >
          日程登録ページへ
        </button>

        <button
          onClick={() => history.push("/personal")}
          className="w-72 p-4 rounded-2xl bg-[#FDB9C8] text-black font-bold shadow-lg hover:opacity-80"
        >
          個人日程登録ページへ
        </button>

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-80">
          <h2 className="text-lg font-bold mb-2">共有ページに移動</h2>
          <input
            type="text"
            placeholder="共有リンクIDを入力"
            value={shareId}
            onChange={(e) => setShareId(e.target.value)}
            className="w-full p-3 mb-4 rounded-lg text-black"
          />
          <button
            onClick={handleGoLink}
            className="w-full p-3 rounded-xl bg-[#FDB9C8] text-black font-bold hover:opacity-80"
          >
            移動
          </button>
        </div>
      </div>
    </div>
  );
}
