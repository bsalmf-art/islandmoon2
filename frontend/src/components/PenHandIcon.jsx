import React from "react";

// Memo with pen emoji - Saudi style formal indicator
export default function PenHandIcon({ size = 24, className = "", color = "currentColor" }) {
  // We render the 📝 emoji at the requested size for a clean formal look
  const fontSize = `${size}px`;
  return (
    <span
      className={`inline-flex items-center justify-center leading-none ${className}`}
      style={{ fontSize, lineHeight: 1, width: fontSize, height: fontSize, color }}
      aria-hidden="true"
    >
      📝
    </span>
  );
}
