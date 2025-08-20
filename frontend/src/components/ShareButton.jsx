import React from "react";

export default function ShareButton({ link }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.origin + link);
    alert("リンクをコピーしました！");
  };

  return (
    <button
      onClick={handleCopy}
      className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
    >
      共有リンクをコピー
    </button>
  );
}
