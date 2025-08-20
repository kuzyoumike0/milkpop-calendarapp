import React from "react";

export default function ShareButton({ link }) {
  return (
    <button
      className="bg-[#FDB9C8] text-black px-4 py-2 rounded-xl"
      onClick={() => navigator.clipboard.writeText(link)}
    >
      リンクコピー
    </button>
  );
}
