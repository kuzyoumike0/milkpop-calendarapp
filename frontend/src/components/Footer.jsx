import React from "react";
import { Heart, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="main-footer decorated-footer">
      <p>
        <Heart className="inline text-pink-400 mr-1" size={16} />
        © 2025 MilkPOP Calendar - All Rights Reserved
      </p>
      <a
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-link"
      >
        <Github className="inline mr-1" size={16} /> GitHub
      </a>
    </footer>
  );
};

export default Footer;
