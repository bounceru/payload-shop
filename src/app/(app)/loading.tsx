"use client";

import React from "react";

/** Optionally allow passing `color` if you want dynamic or fallback. */
export default function Loading({ color = "#ED6D38" }: { color?: string }) {
  return (
    <div className="flex justify-center items-center h-screen">
      {/* 
        We apply the color via a CSS variable. 
        The 3 dots get that color from `var(--dot-color)`.
      */}
      <div
        className="bouncing-loader"
        style={{ ["--dot-color" as any]: color }}
      >
        <div />
        <div />
        <div />
      </div>

      {/* Inline <style> with the bouncing animation. */}
      <style jsx>{`
        .bouncing-loader {
          display: flex;
          justify-content: center;
        }
        .bouncing-loader > div {
          width: 16px;
          height: 16px;
          margin: 3px 6px;
          border-radius: 50%;
          background-color: var(--dot-color, #a3a1a1);
          opacity: 1;
          animation: bouncing-loader 0.6s infinite alternate;
        }
        /* The keyframes for that "bounce" + fade effect */
        @keyframes bouncing-loader {
          to {
            opacity: 0.1;
            transform: translateY(-16px);
          }
        }
        /* Delay each dot so they bounce in a staggered sequence */
        .bouncing-loader > div:nth-child(2) {
          animation-delay: 0.2s;
        }
        .bouncing-loader > div:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
