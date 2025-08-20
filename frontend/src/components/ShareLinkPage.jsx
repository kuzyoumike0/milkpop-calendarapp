import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ShareLinkPage() {
  const [links, setLinks] = useState([]);

  // DBからリンク一覧を取得
  useEffect(() => {
    axios.get("/api/share-links").then((res) => setLinks(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-[#FDB9C8]">共有リンク一覧</h2>

      {links.length === 0 ? (
        <p className="text-gray-400">まだ共有リンクがありません。</p>
      ) : (
        <div className="space-y-4">
          {links.map((link, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#111] rounded-lg border border-[#333] shadow-md flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-[#004CA0]">{link.title}</h3>
                <a
                  href={`/share/${link.linkid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FDB9C8] underline"
                >
                  {window.location.origin}/share/{link.linkid}
                </a>
              </div>
              <span className="text-sm text-gray-400">
                作成日: {new Date(link.created_at).toLocaleDateString("ja-JP")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
