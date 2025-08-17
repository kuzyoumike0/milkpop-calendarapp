import React from "react";
import { Link } from "react-router-dom";

export default function Banner() {
  return (
    <div style={{
      background: "linear-gradient(90deg,#004CA0,#000)",
      padding: "15px",
      color: "#FDB9C8",
      fontWeight: "bold",
      fontSize: "22px",
      textAlign: "left"
    }}>
      <Link to="/" style={{ color: "#FDB9C8", textDecoration: "none" }}>
        MilkpopCalendar
      </Link>
    </div>
  );
}
