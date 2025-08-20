import React from "react";

export default function ShareButton({ url }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert("リンクをコピーしました！");
  };

  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-xl text-center">
      <p className="mb-2 text-white">共有リンク:</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block break-all text-[#FDB9C8] underline"
      >
        {url}
      </a>
      <button
        onClick={copyToClipboard}
        className="mt-3 px-4 py-2 bg-[#004CA0] text-white rounded-lg hover:bg-blue-700"
      >
        コピー
      </button>
    </div>
  );
}
