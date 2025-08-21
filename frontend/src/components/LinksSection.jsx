import React from "react";

function LinksSection({ links }) {
  return (
    <div className="flex flex-col items-center gap-6 mt-12">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          className="w-80 p-6 bg-gradient-to-br from-[#FDB9C8]/20 to-[#004CA0]/20
                     rounded-xl shadow-md text-center backdrop-blur-sm
                     hover:scale-105 hover:shadow-[#FDB9C8]/40
                     transition-all duration-300"
        >
          <h3 className="text-xl font-bold text-[#FDB9C8] mb-2">{link.label}</h3>
          <p className="text-gray-300 text-sm">{link.description}</p>
        </a>
      ))}
    </div>
  );
}

export default LinksSection;
