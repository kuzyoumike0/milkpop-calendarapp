import React from "react";

export default function ShareButton({ link }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(window.location.origin + link)}
      className="bg-[#FDB9C8] text-black px-4 py-2 rounded mt-2 shadow hover:scale-105"
    >
      リンクをコピー
    </button>
  );
}
