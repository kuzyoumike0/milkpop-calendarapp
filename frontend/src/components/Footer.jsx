// frontend/src/components/Footer.jsx
import React from "react";
import { FaTwitter, FaDiscord } from "react-icons/fa";

const Footer = () => {
  return (
    <footer>
      <p>© 2025 MilkPOP Calendar - All Rights Reserved</p>
      <div className="sns-links">
        {/* X (Twitter) */}
        <a
          href="https://x.com/Soni_complaint"
          target="_blank"
          rel="noopener noreferrer"
          className="twitter"
        >
          <FaTwitter />
        </a>

        {/* Discord */}
        <a
          href="https://discord.gg/ACRFgQbA"
          target="_blank"
          rel="noopener noreferrer"
          className="discord"
        >
          <FaDiscord />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
