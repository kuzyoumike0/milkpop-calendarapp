import React from "react";

export default function ShareButton({ url }) {
  const tweet = () => {
    const text = encodeURIComponent("日程を共有しました！ MilkPOP Calendar");
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, "_blank");
  };

  return (
    <button onClick={tweet} className="bg-[#004CA0] text-white px-4 py-2 rounded">
      Twitterで共有
    </button>
  );
}
