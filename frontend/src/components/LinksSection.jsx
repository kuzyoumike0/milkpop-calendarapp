import React from "react";

const LinksSection = ({ links }) => {
  // links が配列じゃなかったら空配列にする
  const safeLinks = Array.isArray(links) ? links : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {safeLinks.map((link, index) => (
        <a
          key={index}
          href={link.url}
          className="block p-6 rounded-2xl shadow-lg bg-white/10 backdrop-blur-lg border border-white/20 hover:scale-105 transition transform duration-300"
        >
          <h3 className="text-lg font-semibold text-pink-300">{link.label}</h3>
          {link.description && (
            <p className="text-sm text-gray-300 mt-1">{link.description}</p>
          )}
        </a>
      ))}
    </div>
  );
};

export default LinksSection;
