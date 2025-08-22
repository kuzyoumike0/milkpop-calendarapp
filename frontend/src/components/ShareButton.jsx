// frontend/src/components/ShareButton.jsx
import React from "react";

const ShareButton = ({ url }) => {
  if (!url) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert("共有リンクをコピーしました！");
  };

  return (
    <div className="flex items-center gap-4 mt-4">
      <p className="text-gray-300 break-all">{url}</p>
      <button
        onClick={handleCopy}
        className="px-4 py-2 rounded-lg bg-[#FDB9C8] text-black font-bold shadow-md hover:opacity-80"
      >
        コピー
      </button>
    </div>
  );
};

export default ShareButton;
