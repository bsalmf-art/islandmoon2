import React from "react";

// Hand holding pen - custom official-looking icon
export default function PenHandIcon({ size = 24, className = "", color = "currentColor" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Pen shaft */}
      <path
        d="M48.5 9.5L52.5 13.5L20 46L14.5 49.5L17 44L48.5 9.5Z"
        fill={color}
        opacity="0.18"
      />
      <path
        d="M48.5 9.5L52.5 13.5L20 46L14.5 49.5L17 44L48.5 9.5Z"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Pen tip */}
      <path
        d="M14.5 49.5L17 44L20 46L14.5 49.5Z"
        fill={color}
      />
      {/* Pen cap detail */}
      <path
        d="M44 14L48 18"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Hand - thumb */}
      <path
        d="M14 49C9 50 6 53.5 5.5 56.5C5.2 58 6 59.5 8 60H38C40 60 42 58.5 42 56C42 54 40.5 52.5 38 52.5L24 52C22 52 20.5 51 19 49.5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={color}
        fillOpacity="0.15"
      />
      {/* Knuckle line */}
      <path
        d="M16 55L36 55"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
