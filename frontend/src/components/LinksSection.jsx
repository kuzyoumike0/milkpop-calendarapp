import React from "react";

function LinksSection({ links }) {
  return (
    <div className="flex flex-wrap justify-center gap-8 mt-16">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          className="w-80 p-6 bg-gradient-to-br from-[#FDB9C8]/20 to-[#004CA0]/20
                     rounded-2xl shadow-md text-center backdrop-blur-sm
                     hover:scale-105 hover:shadow-[#FDB9C8]/50
                     transition-all duration-300 group"
        >
          <h3 className="text-2xl font-bold text-[#FDB9C8] mb-2 group-hover:text-[#004CA0] transition">
            {link.label}
          </h3>
          <p className="text-gray-300 text-sm">{link.description}</p>
        </a>
      ))}
    </div>
  );
}

export default LinksSection;
