import React from "react";

export default function LinkCard({ href, title, description }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-6 rounded-2xl shadow-lg bg-white/10 backdrop-blur-md 
                 hover:bg-white/20 transition duration-300 border border-white/20"
    >
      <h3 className="text-xl font-bold text-pink-400 mb-2">{title}</h3>
      <p className="text-sm text-gray-200">{description}</p>
    </a>
  );
}
