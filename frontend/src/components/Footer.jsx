// frontend/src/components/Footer.jsx
import React from "react";
import { FaTwitter, FaDiscord } from "react-icons/fa";
import "../index.css";

function Footer() {
  return (
    <footer>
      <p>© 2025 MilkPOP Calendar</p>
      <div className="footer-links">
        <a
          href="https://twitter.com/xxxx"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <FaTwitter className="footer-icon" />
          Twitter
        </a>
        <a
          href="https://discord.gg/xxxx"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <FaDiscord className="footer-icon" />
          Discord
        </a>
      </div>
    </footer>
  );
}

export default Footer;
