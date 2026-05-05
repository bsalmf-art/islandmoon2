import React from "react";

export default function PageBackground({ children }) {
  return (
    <div className="bg-aurora bg-grain min-h-screen relative">
      {/* Floating petals */}
      <svg className="petal" style={{ top: "12%", right: "8%" }} width="56" height="56" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C13 7 17 8 22 12C17 16 13 17 12 22C11 17 7 16 2 12C7 8 11 7 12 2Z" fill="#FF4FA3" opacity="0.7" />
      </svg>
      <svg className="petal" style={{ top: "55%", right: "85%" }} width="44" height="44" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C13 7 17 8 22 12C17 16 13 17 12 22C11 17 7 16 2 12C7 8 11 7 12 2Z" fill="#F59E0B" opacity="0.6" />
      </svg>
      <svg className="petal" style={{ top: "78%", right: "12%" }} width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C13 7 17 8 22 12C17 16 13 17 12 22C11 17 7 16 2 12C7 8 11 7 12 2Z" fill="#8B5CF6" opacity="0.7" />
      </svg>
      <svg className="petal" style={{ top: "30%", right: "78%" }} width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C13 7 17 8 22 12C17 16 13 17 12 22C11 17 7 16 2 12C7 8 11 7 12 2Z" fill="#38BDF8" opacity="0.6" />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
