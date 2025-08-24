import React from "react";
import twitterIcon from "../assets/twitter.svg";
import discordIcon from "../assets/discord.svg";

export default function Footer() {
  return (
    <footer>
      <p>© 2025 MilkPOP Calendar</p>
      <div className="footer-icons">
        <a href="https://twitter.com/youraccount" target="_blank" rel="noreferrer">
          <img src={twitterIcon} alt="Twitter" />
        </a>
        <a href="https://discord.gg/yourserver" target="_blank" rel="noreferrer">
          <img src={discordIcon} alt="Discord" />
        </a>
      </div>
    </footer>
  );
}
