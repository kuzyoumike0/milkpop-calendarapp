import React from "react";
import { useParams } from "react-router-dom";

export default function ShareLinkPage() {
  const { linkid } = useParams();
  return (
    <div className="p-8 text-white text-center">
      <h1 className="text-2xl font-bold mb-4">共有リンク</h1>
      <p className="mb-2">以下のリンクを参加者に共有してください。</p>
      <a
        href={`/link/${linkid}`}
        className="text-blue-400 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {window.location.origin}/link/{linkid}
      </a>
    </div>
  );
}
