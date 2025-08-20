import React from "react";

export default function ShareButton({ link }) {
  if (!link) return null;
  return (
    <div className="mt-4">
      <p>共有リンク:</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline"
      >
        {link}
      </a>
    </div>
  );
}
