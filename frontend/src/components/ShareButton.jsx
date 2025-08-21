import React from "react";

function ShareButton({ url }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert("リンクをコピーしました！");
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-[#FDB9C8] text-black font-bold rounded-lg
                 hover:bg-[#004CA0] hover:text-white transition-all duration-300"
    >
      共有リンクをコピー
    </button>
  );
}

export default ShareButton;
