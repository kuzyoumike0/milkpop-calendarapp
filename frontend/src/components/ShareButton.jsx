import React from "react";

export default function ShareButton({ link }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(link)}
      className="bg-[#FDB9C8] text-black px-4 py-2 rounded hover:bg-pink-400"
    >
      リンクをコピー
    </button>
  );
}
