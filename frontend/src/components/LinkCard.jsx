import React from "react";

export default function LinkCard({ link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full md:w-1/2 p-4"
    >
      <div className="bg-gray-900 text-white rounded-2xl shadow-lg p-6 hover:bg-gray-800 transition transform hover:scale-105">
        <h3 className="text-lg font-bold mb-2">{link.title}</h3>
        <p className="text-sm opacity-80">{link.description}</p>
      </div>
    </a>
  );
}
